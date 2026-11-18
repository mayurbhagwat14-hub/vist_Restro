import { z } from "zod";
import { ValidationError } from "../../core/auth/errors.js";
import { normalizePlatform } from "../../utils/platform.js";

const schema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(8, "Phone must be at least 8 digits")
    .max(15, "Phone must be at most 15 digits"),
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d{4}$/, "OTP must be numeric and exactly 4 digits"),
  referralCode: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? String(val).trim().toUpperCase() : "")),
  ref: z.string().trim().max(64).optional().or(z.literal("")),
  fcmToken: z.string().optional(),
  platform: z.preprocess(
    (value) => normalizePlatform(value, { allowUndefined: true }),
    z.enum(["web", "mobile"]).optional(),
  ),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)").optional(),
});

export const validateUserOtpVerifyDto = (body) => {
  let cleanPhone = String(body?.phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.slice(1);
  } else if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }

  const payload = {
    ...body,
    phone: cleanPhone || body?.phone
  };

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }
  return result.data;
};
