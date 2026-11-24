import crypto from 'crypto';
import ms from 'ms';
import { FoodOtp } from './otp.model.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { ValidationError } from '../auth/errors.js';

const generateOtpCode = () => {
    const code = crypto.randomInt(1000, 10000);
    return String(code);
};

/**
 * Sends SMS via SMS India Hub API
 * @param {string} phone - 10-digit mobile number (will be prefixed with 91)
 * @param {string} otp
 */
/**
 * Build the 12-digit Indian MSISDN (91XXXXXXXXXX).
 * NOTE: a 10-digit mobile can itself start with "91" (e.g. 9123456789), so the
 * country code must be decided by length, not by a "91" prefix check.
 */
const toIndianMsisdn = (phone) => {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits.slice(-10).length === 10 ? `91${digits.slice(-10)}` : digits;
};

/** Returns true when SMS India Hub accepted the message. Never throws. */
const sendSmsViaIndiaHub = async (phone, otp) => {
    try {
        if (!config.smsApiKey || !config.smsSenderId) {
            logger.error('[SMS] SMS India Hub is not configured (SMS_INDIA_HUB_API_KEY / SMS_INDIA_HUB_SENDER_ID missing)');
            return false;
        }
        const msisdn = toIndianMsisdn(phone);

        // EXACT approved DLT template (sender BGADPL) — text must match character-for-character:
        // "Welcome to ##var##, powered by ##var##. Your OTP for registration ##var##. This OTP is valid for 10 minutes. Please do not share it with anyone.BGADPL"
        // (DLT Template Id 1077104580057767222, template name "App Login")
        const message = `Welcome to VIST Restaurant, powered by Appzeto. Your OTP for registration ${otp}. This OTP is valid for 10 minutes. Please do not share it with anyone.BGADPL`;

        // SMS India Hub HTTP GET API — query param names are case-sensitive per SOP
        const url = new URL('http://cloud.smsindiahub.in/vendorsms/pushsms.aspx');
        url.searchParams.append('APIKey', config.smsApiKey);
        url.searchParams.append('sid', config.smsSenderId);
        url.searchParams.append('msisdn', msisdn);
        url.searchParams.append('msg', message);
        url.searchParams.append('gwid', '2');
        url.searchParams.append('fl', '0');
        if (config.smsIndiaHubUsername) {
            url.searchParams.append('uname', config.smsIndiaHubUsername);
        }
        if (config.smsDltTemplateId) {
            url.searchParams.append('DLT_TE_ID', config.smsDltTemplateId);
        }

        logger.info(`[SMS] Sending OTP to ${msisdn} via SMS India Hub...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url.toString(), { signal: controller.signal }).finally(() => clearTimeout(timeout));
        const resultText = await response.text();
        logger.info(`[SMS] Raw response for ${msisdn}: ${resultText}`);

        // SMS India Hub often returns HTTP 200 OK even for errors — check response body
        let parsed = null;
        try { parsed = JSON.parse(resultText); } catch (_) { /* plain text response is OK */ }

        if (parsed && parsed.ErrorCode && parsed.ErrorCode !== '000') {
            const errMsg = `SMS India Hub ERROR for ${phone}: [${parsed.ErrorCode}] ${parsed.ErrorMessage || resultText}`;
            logger.error(errMsg);
            // eslint-disable-next-line no-console
            console.error(`❌ [SMS ERROR] ${errMsg}`);
            if (parsed.ErrorCode === '006') {
                // eslint-disable-next-line no-console
                console.error('❌ [SMS ERROR] ErrorCode 006 = DLT Template mismatch. The message text must EXACTLY match your registered TRAI DLT template. Login to https://cloud.smsindiahub.in and verify the approved template text.');
            }
            return false;
        } else if (!response.ok) {
            logger.error(`SMS API HTTP error for ${phone}: ${response.status} – ${resultText}`);
            return false;
        }
        logger.info(`✅ SMS sent successfully to ${msisdn}`);
        return true;
    } catch (error) {
        logger.error(`Error sending SMS to ${phone}: ${error.message}`);
        return false;
    }
};

export const createOrUpdateOtp = async (phone) => {
    const existing = await FoodOtp.findOne({ phone });
    const now = new Date();

    // Rate Limiting Logic
    if (existing) {
        const windowMs = (config.otpRateWindow || 600) * 1000;
        const isInWindow = now - existing.lastRequestAt < windowMs;

        if (isInWindow && !config.useDefaultOtp) {
            if (existing.requestCount >= (config.otpRateLimit || 3)) {
                logger.warn(`Rate limit exceeded for phone ${phone}`);
                throw new ValidationError(`Too many OTP requests. Please try again after ${Math.ceil(windowMs / 60000)} minutes.`);
            }
            existing.requestCount += 1;
        } else {
            // Reset count if window has passed
            existing.requestCount = 1;
        }
    }

    let otp;
    if (config.useDefaultOtp) {
        otp = '1234';
        logger.info(`Default OTP mode enabled – OTP is ${otp} for phone ${phone}`);
    } else {
        otp = generateOtpCode();
    }

    // Expiry calculation: prioritize seconds, then minutes, then fallback to MS string
    let ttlMs;
    if (config.otpExpirySeconds) {
        ttlMs = config.otpExpirySeconds * 1000;
    } else if (config.otpExpiryMinutes) {
        ttlMs = config.otpExpiryMinutes * 60 * 1000;
    } else {
        ttlMs = ms(config.otpExpiry || '5m');
    }
    const expiresAt = new Date(now.getTime() + ttlMs);

    if (existing) {
        existing.otp = otp;
        existing.expiresAt = expiresAt;
        existing.attempts = 0;
        existing.lastRequestAt = now;
        await existing.save();
    } else {
        await FoodOtp.create({ 
            phone, 
            otp, 
            expiresAt,
            requestCount: 1,
            lastRequestAt: now
        });
    }

    // Only send SMS if not in default OTP mode
    if (!config.useDefaultOtp) {
        const sent = await sendSmsViaIndiaHub(phone, otp);
        if (!sent) {
            // Tell the client instead of pretending the OTP was sent (it would never arrive).
            throw new ValidationError('Could not send OTP SMS right now. Please try again in a minute.');
        }
    }

    return otp;
};

export const verifyOtp = async (phone, otp) => {
    // If default OTP mode is active, accept 1234 or 123456 immediately
    if (config.useDefaultOtp && (String(otp).trim() === '1234' || String(otp).trim() === '123456')) {
        const record = await FoodOtp.findOne({ phone });
        if (record) {
            await record.deleteOne();
        }
        return { valid: true };
    }

    const record = await FoodOtp.findOne({ phone });
    if (!record) {
        return { valid: false, reason: 'OTP not found' };
    }

    if (record.expiresAt < new Date()) {
        return { valid: false, reason: 'OTP expired' };
    }

    if (record.attempts >= config.otpMaxAttempts) {
        return { valid: false, reason: 'Max attempts exceeded' };
    }

    record.attempts += 1;

    if (record.otp !== otp) {
        await record.save();
        return { valid: false, reason: 'Invalid OTP' };
    }

    await record.deleteOne();
    return { valid: true };
};

