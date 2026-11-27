/**
 * Delivery partner (rider) authentication — phone OTP login, ported from DoorDish.
 *
 * Flow:
 *   1. requestDeliveryOtp(phone)           -> sends OTP (same OTP store as user login)
 *   2. verifyDeliveryOtpAndLogin(phone, otp)
 *        - no partner for phone       -> { needsRegistration: true }  (frontend goes to signup)
 *        - partner pending/rejected   -> { pendingApproval: true, ... } (admin must approve)
 *        - partner approved           -> { accessToken, refreshToken, user }
 */
import ms from "ms";
import { FoodDeliveryPartner } from "../../modules/food/delivery/models/deliveryPartner.model.js";
import { findDeliveryPartnerByPhone } from "../../modules/food/delivery/services/delivery.service.js";
import { createOrUpdateOtp, verifyOtp } from "../otp/otp.service.js";
import { signAccessToken, signRefreshToken } from "./token.util.js";
import { FoodRefreshToken } from "../refreshTokens/refreshToken.model.js";
import { ValidationError, AuthError } from "./errors.js";
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const DELIVERY_PARTNER_ROLE = "DELIVERY_PARTNER";

const toSafeImageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.url || value.secure_url || "";
  return "";
};

const sanitizeDeliveryForAuthResponse = (deliveryDoc = {}) => {
  const id = deliveryDoc?._id?.toString?.() || deliveryDoc?.id?.toString?.() || null;
  return {
    id,
    _id: id,
    name: deliveryDoc?.name || "",
    phone: deliveryDoc?.phone || "",
    email: deliveryDoc?.email || "",
    status: deliveryDoc?.status || "",
    profileImage: toSafeImageUrl(deliveryDoc?.profilePhoto),
    walletAmount: Number(deliveryDoc?.walletAmount || 0),
    refCode: deliveryDoc?.referralCode || "",
  };
};

/**
 * Delivery-panel test number: always logs in with a fixed OTP and no SMS is sent.
 * Applies ONLY to the delivery partner login and ONLY to this exact number.
 */
const DELIVERY_TEST_PHONE = "8766556836";
const DELIVERY_TEST_OTP = "1234";

const isDeliveryTestPhone = (phone) =>
  String(phone || "").replace(/\D/g, "").slice(-10) === DELIVERY_TEST_PHONE;

export const requestDeliveryOtp = async (phone) => {
  if (!phone) {
    throw new ValidationError("Phone is required");
  }
  const otp = await createOrUpdateOtp(
    phone,
    isDeliveryTestPhone(phone) ? { staticOtp: DELIVERY_TEST_OTP } : {},
  );
  // Same exposure rule as user login (OTP returned only outside production / default-OTP mode).
  const shouldExposeOtp = config.nodeEnv !== "production" || config.useDefaultOtp;
  return shouldExposeOtp ? { otp } : {};
};

export const verifyDeliveryOtpAndLogin = async (phone, otp, fcmToken, platform, confirmAction) => {
  const existingPartner = await findDeliveryPartnerByPhone(phone);

  const result = await verifyOtp(phone, otp);
  if (!result.valid) {
    throw new AuthError(result.reason || "OTP verification failed");
  }

  let deliveryPartner = existingPartner;

  // Soft-deleted account: ask the client whether to restore or start fresh.
  if (deliveryPartner && deliveryPartner.status === "deleted") {
    if (!confirmAction) {
      return {
        deletedAccountFound: true,
        phone,
        role: DELIVERY_PARTNER_ROLE,
        name: deliveryPartner.name,
      };
    }
    if (confirmAction === "restore") {
      // Accounts can be deactivated by admin, so a self-restore must go back through
      // admin approval instead of re-activating the rider immediately.
      deliveryPartner.status = "pending";
      await deliveryPartner.save();
      logger.info({ partnerId: deliveryPartner._id }, "Delivery partner restore requested (pending admin approval)");
    } else if (confirmAction === "new") {
      deliveryPartner.phone = `${deliveryPartner.phone}_deleted_${Date.now()}`;
      await deliveryPartner.save();
      deliveryPartner = null;
    }
  }

  if (!deliveryPartner) {
    return { needsRegistration: true, phone };
  }

  // Save FCM token before the approval gate so we can notify the rider once approved.
  if (fcmToken) {
    try {
      const { upsertFirebaseDeviceToken } = await import("../notifications/firebase.service.js");
      await upsertFirebaseDeviceToken({
        ownerType: DELIVERY_PARTNER_ROLE,
        ownerId: String(deliveryPartner._id),
        token: fcmToken,
        platform: platform === "mobile" ? "mobile" : "web",
      });
    } catch (err) {
      logger.warn(`Delivery FCM token save failed: ${err?.message || err}`);
    }
  }

  const partnerStatus = deliveryPartner.status || "pending";
  if (partnerStatus !== "approved") {
    const isRejected = partnerStatus === "rejected";
    return {
      pendingApproval: true,
      isRejected,
      rejectionReason: isRejected ? deliveryPartner.rejectionReason : null,
      message: isRejected
        ? deliveryPartner.rejectionReason
          ? `Your account was rejected: ${deliveryPartner.rejectionReason}`
          : "Your delivery account was not approved. Please contact support."
        : "Your account is pending admin verification. You will be notified once approved.",
    };
  }

  const payload = { userId: deliveryPartner._id.toString(), role: DELIVERY_PARTNER_ROLE };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const ttlMs = ms(config.jwtRefreshExpiresIn || "7d");

  await FoodRefreshToken.create({
    userId: deliveryPartner._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + ttlMs),
  });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: sanitizeDeliveryForAuthResponse(deliveryPartner?.toObject?.() || deliveryPartner),
    needsRegistration: false,
  };
};

/** Shape returned by GET /auth/me for a delivery partner (matches DoorDish frontend expectations). */
export const getDeliveryPartnerProfile = async (id) => {
  const partner = await FoodDeliveryPartner.findById(id).lean();
  if (!partner) return null;
  const deliveryId = partner._id ? `DP-${partner._id.toString().slice(-8).toUpperCase()}` : null;
  return {
    ...partner,
    email: partner.email || null,
    deliveryId,
    status: partner.status === "rejected" ? "blocked" : partner.status,
    profileImage: partner.profilePhoto ? { url: partner.profilePhoto } : null,
    documents: {
      aadhar:
        partner.aadharPhoto || partner.aadharNumber
          ? { number: partner.aadharNumber || null, document: partner.aadharPhoto || null }
          : null,
      pan:
        partner.panPhoto || partner.panNumber
          ? { number: partner.panNumber || null, document: partner.panPhoto || null }
          : null,
      drivingLicense:
        partner.drivingLicensePhoto || partner.drivingLicenseNumber
          ? { number: partner.drivingLicenseNumber || null, document: partner.drivingLicensePhoto || null }
          : null,
      bankDetails:
        partner.bankAccountHolderName ||
        partner.bankAccountNumber ||
        partner.bankIfscCode ||
        partner.bankName ||
        partner.upiId ||
        partner.upiQrCode
          ? {
              accountHolderName: partner.bankAccountHolderName || null,
              accountNumber: partner.bankAccountNumber || null,
              ifscCode: partner.bankIfscCode || null,
              bankName: partner.bankName || null,
              upiId: partner.upiId || null,
              upiQrCode: partner.upiQrCode || null,
            }
          : null,
    },
    location:
      partner.address || partner.city || partner.state
        ? { addressLine1: partner.address, city: partner.city, state: partner.state }
        : null,
    vehicle:
      partner.vehicleType || partner.vehicleName || partner.vehicleNumber
        ? {
            type: partner.vehicleType,
            brand: partner.vehicleName,
            model: partner.vehicleName,
            number: partner.vehicleNumber,
          }
        : null,
  };
};

/** Used by refresh-token flow: only approved partners may keep getting fresh tokens. */
export const isDeliveryPartnerActive = async (id) => {
  const partner = await FoodDeliveryPartner.findById(id).select("status").lean();
  return Boolean(partner && partner.status === "approved");
};
