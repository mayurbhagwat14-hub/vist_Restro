import { z } from 'zod';
import { ValidationError } from '../../core/auth/errors.js';
import { config } from '../../config/env.js';

const normalizePhoneInput = (val) => {
    if (!val) return '';
    let digits = String(val).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.slice(1);
    } else if (digits.length > 10) {
        digits = digits.slice(-10);
    }
    return digits;
};

export const validateUserOtpRequestDto = (body) => {
    const rawPhone = body?.phone;
    const cleanPhone = normalizePhoneInput(rawPhone);

    if (!cleanPhone) {
        throw new ValidationError('Phone is required');
    }
    if (cleanPhone.length !== 10) {
        throw new ValidationError('Phone number must be exactly 10 digits');
    }

    // In default OTP / dev mode, allow any 10-digit dummy/test number.
    // In production mode with real SMS, ensure standard mobile range unless useDefaultOtp is enabled.
    if (!config.useDefaultOtp && config.nodeEnv === 'production') {
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            throw new ValidationError('Invalid mobile number');
        }
    }

    return {
        ...body,
        phone: cleanPhone
    };
};

