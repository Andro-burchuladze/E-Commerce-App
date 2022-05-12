import passwordGenerate from 'generate-password';

export const tokenTypes = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD_VIA_MOBILE_NUMBER: 'resetPasswordViaMobileNumber',
    RESET_PASSWORD_VIA_EMAIL: 'resetPasswordViaEmail',
    VERIFY_MOBILE_NUMBER: 'verifyMobileNumber',
    VERIFY_EMAIL: 'verifyEmail'
};

export function generateRandomSixDigit() {
    return passwordGenerate.generate({
        length: 6,
        numbers: true,
        lowercase: false,
        uppercase: false
    });
}