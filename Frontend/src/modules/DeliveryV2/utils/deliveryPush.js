/**
 * Delivery-partner push helpers.
 *
 * DoorDish's delivery onboarding screens call a set of FCM helpers that Vist's shared
 * firebaseMessaging module does not have. This file provides the same API, built on
 * Vist's push client, so the user/admin push flow stays untouched.
 */
import api from "@food/api";
import {
  registerWebPushForCurrentModule,
  initPushNotificationClient,
  isNativeAppWebView as isNativeWebView,
  resolveDeviceFcmToken,
  rememberSyncedFcmToken,
  forgetSyncedFcmToken,
} from "@food/utils/firebaseMessaging";

const FAST_COLLECT_TIMEOUT_MS = 2500;
const SIGNUP_COLLECT_TIMEOUT_MS = 4000;

const withTimeout = (promise, ms, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

const defaultPlatform = () => (isNativeWebView() ? "mobile" : "web");

export const isNativeAppWebView = () => isNativeWebView();

export function getWebNotificationPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/** Warm up the token in the background (never prompts for permission). */
export function prefetchModuleFcmToken(moduleName = "delivery") {
  void resolveDeviceFcmToken({ moduleName, requestPermission: false }).catch(() => {});
}

/** Get a token quickly for the login request; resolves with a null token on timeout. */
export async function collectFcmTokenFast(moduleName = "delivery") {
  return withTimeout(
    resolveDeviceFcmToken({ moduleName, requestPermission: false }),
    FAST_COLLECT_TIMEOUT_MS,
    { fcmToken: null, platform: defaultPlatform() },
  );
}

/** Signup is a deliberate action, so we may ask for notification permission here. */
export async function collectFcmTokenForSignup(moduleName = "delivery") {
  return withTimeout(
    resolveDeviceFcmToken({ moduleName, requestPermission: true }),
    SIGNUP_COLLECT_TIMEOUT_MS,
    { fcmToken: null, platform: defaultPlatform() },
  );
}

export function markBackendSyncedToken(moduleName, token) {
  rememberSyncedFcmToken(moduleName, token);
}

export function clearOnboardingFcmLocal(moduleName = "delivery") {
  forgetSyncedFcmToken(moduleName);
}

/**
 * Ensure the logged-in partner's token is saved on the backend.
 * Vist's push client saves the token for the module once an access token exists.
 */
export async function persistModuleFcmToken(moduleName = "delivery") {
  try {
    await registerWebPushForCurrentModule(`/food/${moduleName}`);
    return true;
  } catch {
    return false;
  }
}

/** Save the token for a partner still awaiting approval (no session yet). */
async function savePendingToken(moduleName, phone, { fcmToken, platform } = {}) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
  if (!normalizedPhone) return false;
  let token = fcmToken;
  let resolvedPlatform = platform || defaultPlatform();
  if (!token) {
    const collected = await collectFcmTokenFast(moduleName);
    token = collected.fcmToken;
    resolvedPlatform = collected.platform;
  }
  if (!token) return false;
  try {
    await api.post("/fcm-tokens/pending-save", {
      phone: normalizedPhone,
      token,
      platform: resolvedPlatform,
      role: moduleName,
    });
    rememberSyncedFcmToken(moduleName, token);
    return true;
  } catch {
    return false;
  }
}

export function syncPendingPartnerFcmQuick(moduleName, phone, options = {}) {
  if (!phone || typeof window === "undefined") return;
  const run = () => void savePendingToken(moduleName, phone, options);
  run();
  [1500, 4000].forEach((ms) => window.setTimeout(run, ms));
}

export async function syncNativeAppPushToken(moduleName, phone) {
  return savePendingToken(moduleName, phone);
}

export async function setupPendingVerificationPushListeners() {
  try {
    initPushNotificationClient();
    return true;
  } catch {
    return false;
  }
}

/** Ask for permission (user tapped "enable notifications") and save the pending token. */
export async function enablePendingVerificationPush(moduleName, phone) {
  if (!phone || !moduleName) return false;
  const { fcmToken, platform } = await resolveDeviceFcmToken({ moduleName, requestPermission: true });
  if (!fcmToken) return false;
  return savePendingToken(moduleName, phone, { fcmToken, platform });
}

/** Store pending state and move the partner to the "awaiting verification" screen. */
export function finalizeDeliveryPendingSubmission(
  navigate,
  phone,
  { fcmToken, platform, status = "pending", message, rejectionReason } = {},
  navigateState = {},
) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
  if (normalizedPhone) sessionStorage.setItem("delivery_pendingPhone", normalizedPhone);
  sessionStorage.setItem("delivery_pendingStatus", status);
  if (message) sessionStorage.setItem("delivery_pendingMessage", message);
  else sessionStorage.removeItem("delivery_pendingMessage");
  if (rejectionReason) sessionStorage.setItem("delivery_pendingRejectionReason", rejectionReason);
  else sessionStorage.removeItem("delivery_pendingRejectionReason");

  try {
    syncPendingPartnerFcmQuick("delivery", normalizedPhone, { fcmToken, platform });
  } catch {
    // Non-blocking.
  }

  navigate("/food/delivery/pending-verification", {
    replace: true,
    state: {
      phone: normalizedPhone,
      isRejected: status === "rejected",
      message,
      rejectionReason,
      ...navigateState,
    },
  });
}
