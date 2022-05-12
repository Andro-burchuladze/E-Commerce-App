import httpStatus from "http-status";
import { Token } from "../models";
import { ApiError } from "../utils";
import { tokenTypes } from "../config/tokens";
import tokenService from "./token.service";
import userService from "./user.service";
import smsService from "./sms.service";
import emailService from "./email.service";
import { mobileNumberRegex } from "../config/regex";
import { IUserDocument } from '../interfaces/User.interface';
import { ITokenDocument } from "src/interfaces/Token.interface";

/**
 * Send Verifiaction SMS or Email
 * @param {String} mobileNumberOrEmail
 * @returns {Promise}
 */
async function sendVerification(mobileNumberOrEmail: string): Promise<void> {
    if (mobileNumberOrEmail.match(mobileNumberRegex)) {
        const user: IUserDocument | null = await userService.getUserByMobileNumber(mobileNumberOrEmail);
        if (user?.isMobileNumberVerified === true) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile number is already verifed');
        }
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Did not find a user with this mobile number');
        }
        const token = await tokenService.generateVerifyMobileNumberToken(user);
        smsService.sendMobileVerification(mobileNumberOrEmail, token);

    } else {
        const user: IUserDocument | null = await userService.getUserByEmail(mobileNumberOrEmail);
        if (user?.isEmailVerified === true) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already verified ');
        }
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Did not find a user with this email');
        }
        const token = await tokenService.generateVerifyEmailToken(user);
        emailService.sendEmailVerification(mobileNumberOrEmail, token);
    }
};

/**
 * Verify mobile number
 * @param {string} mobileNumber
 * @param {string} token
 * @returns {Promise<IUserDocument>}
 */

async function verifyMobileNumber(mobileNumber: string, token: string): Promise<IUserDocument> {
    try {
        const user: IUserDocument | null = await userService.getUserByMobileNumber(mobileNumber);
        if (!user) {
            throw new Error();
        }
        const tokenDoc = await Token.findOne({ user: user.id, token, type: tokenTypes.VERIFY_MOBILE_NUMBER, blacklisted: false });
        if (!tokenDoc) {
            throw new Error();
        }
        if (new Date() > tokenDoc.expires) {
            throw new Error();
        }
        await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_MOBILE_NUMBER });
        await userService.updateUserById(user._id, { isMobileNumberVerified: true });
        return user;
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

/**
 * Verify email
 * @param {string} token
 * @returns {Promise<IUserDocument>}
 */

async function verifyEmail(token: string): Promise<IUserDocument> {
    try {
        const verifyEmailTokenDoc = await tokenService.verifyToken(token, tokenTypes.VERIFY_EMAIL);
        const user: IUserDocument | null = await userService.getUserById(verifyEmailTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
        await userService.updateUserById(user.id, { isEmailVerified: true });
        return user;
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

/**
 * Verify primary
 * @param {string} mobileNumberOrEmail
 * @param {string} password
 * @returns {Promise<IUserDocument>}
 */
async function loginByMobileNumberOrEmailAndPassword(mobileNumberOrEmail: string, password: string): Promise<IUserDocument> {
    let user: IUserDocument | null;
    if (mobileNumberOrEmail.match(mobileNumberRegex)) {
        user = await userService.getUserByMobileNumber(mobileNumberOrEmail);
        if (!user || !(await user.isPasswordMatch(password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'The password or mobile number is incorrect');
        }
        if (user.isMobileNumberVerified === false) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Mobile number did not verified');
        }
    } else {
        user = await userService.getUserByEmail(mobileNumberOrEmail);
        if (!user || !(await user.isPasswordMatch(password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'The password or email is incorrect ');
        }
        if (user.isEmailVerified === false) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Email number did not verified');
        }
    }
    return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */

async function logout(refreshToken: string): Promise<void> {
    const refreshTokenDoc: ITokenDocument | null = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Did not find the refresh token');
    }
    await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
async function refreshAuth(refreshToken: string): Promise<Object> {
    try {
        const refreshTokenDoc: ITokenDocument | null = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
        const user: IUserDocument | null = await userService.getUserById(refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.remove();
        return tokenService.generateAuthsToken(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

/**
 * send reset password sms or email
 * @param {string} mobileNumberOrEmail
 * @param {string} password
 * @returns {Promise}
 */
async function sendResetPasswordSmsOrEmail(mobileNumberOrEmail: string): Promise<void> {
    if (mobileNumberOrEmail.match(mobileNumberRegex)) {
        const user: IUserDocument | null = await userService.getUserByMobileNumber(mobileNumberOrEmail);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Did not find a user with this mobile number');
        }
        const token = await tokenService.generateVerifyMobileNumberToken(user);
        smsService.sendMobileVerification(mobileNumberOrEmail, token);
    } else {
        const user: IUserDocument | null = await userService.getUserByEmail(mobileNumberOrEmail);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Did not find a user with this email');
        }
        const token = await tokenService.generateResetPasswordViaEmailToken(user);
        emailService.sendResetPasswordEmail(mobileNumberOrEmail, token);
    }
};

/**
 * Verify mobile number for reset password
 * @param {string} mobileNumber
 * @param {string} token
 * @returns {Promise<IUserDocument>}
 */

async function verifyMobileNumberForResetPassword(mobileNumber: string, token: string): Promise<IUserDocument> {
    try {
        let user: IUserDocument | null = await userService.getUserByMobileNumber(mobileNumber);
        if (!user) {
            throw new Error();
        }
        const tokenDoc = await Token.findOne({ user: user.id, token, type: tokenTypes.VERIFY_MOBILE_NUMBER, blacklisted: false });
        if (!tokenDoc) {
            throw new Error();
        }
        if (new Date() > tokenDoc.expires) {
            throw new Error();
        }
        await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_MOBILE_NUMBER });
        await userService.updateUserById(user._id, { isMobileNumberVerified: true });
        return user;

    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    };
};

/**
 * Reset passwrod
 * @param {string} mobileNumberOrEmail
 * @param {string} newPassword
 * @param {string} resetPasswordToken
 * @returns {Promise}
 */
async function resetPassword(mobileNumberOrEmail: string, newPassword: string, resetPasswordToken: any): Promise<void> {
    try {
        if (mobileNumberOrEmail === "0") {
            const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
            const user: IUserDocument | null = await userService.getUserById(resetPasswordTokenDoc.user);
            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Reset password failed');
            }
            await userService.updateUserById(user.id, { password: newPassword });
            await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER });
        } else if (mobileNumberOrEmail === "1") {
            const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            const user: IUserDocument | null = await userService.getUserById(resetPasswordTokenDoc.user);
            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Reset password failed');
            }
            await userService.updateUserById(user.id, { password: newPassword });
            await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD_VIA_EMAIL });
        }
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Reset password failed');
    }

};

export default {
    sendVerification,
    verifyMobileNumber,
    verifyEmail,
    loginByMobileNumberOrEmailAndPassword,
    logout,
    refreshAuth,
    sendResetPasswordSmsOrEmail,
    verifyMobileNumberForResetPassword,
    resetPassword,
}

