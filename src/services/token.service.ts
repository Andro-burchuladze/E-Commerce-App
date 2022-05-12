import jwt from 'jsonwebtoken';
import moment from 'moment';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { Token } from '../models';
import config from '../config';
import { tokenTypes, generateRandomSixDigit } from '../config/tokens';
import { ApiError } from '../utils';
import { IToken, ITokenDocument, } from '../interfaces/Token.interface';
import { IUserDocument } from '../interfaces/User.interface';



/**
 * Generate token
 * @param {ObjectId} userID
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
function generateToken(userID: Types.ObjectId, expires: moment.Moment, type: string, secret = config.jwt.secret) {
    const payload = {
        sub: userID,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    }
    return jwt.sign(payload, secret);
}

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userID
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<IToken>}
 */
async function saveToken(token: string, userID: Types.ObjectId, expires: moment.Moment, type: string, blacklisted = false): Promise<IToken> {
    const tokenDoc: IToken = await Token.create({
        token,
        user: userID,
        expires: expires.toDate(),
        type,
        blacklisted
    });
    return tokenDoc;

}

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<ITokenDocument>}
 */
async function verifyToken(token: string, type: string): Promise<ITokenDocument> {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc: ITokenDocument | null = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
    if (!tokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Did not find token');
    }
    return tokenDoc;
}

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
async function generateAuthsToken(user: IUserDocument): Promise<object> {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user._id, accessTokenExpires, tokenTypes.ACCESS);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user._id, refreshTokenExpires, tokenTypes.REFRESH);
    await saveToken(refreshToken, user._id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate()
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate()
        }
    };
}

/**
 * Generate reset password via mobile number token
 * @param {string} user
 * @returns {Promise<string>}
 */
async function generateResetPasswordViaMobileNumberToken(user: IUserDocument): Promise<string> {
    const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
    const token = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
    await saveToken(token, user._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
    return token;
}

/**
 * Generate reset password via email token
 * @param {string} user
 * @returns {Promise<string>}
 */
async function generateResetPasswordViaEmailToken(user: IUserDocument): Promise<string> {
    const expires = moment().add(config.jwt.resetPasswordViaEmailExpirationMinutes, 'minutes');
    const token = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
    await saveToken(token, user._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
    return token;
}

/**
 * Generate verify mobile number token
 * @param {User} user
 * @returns {Promise<string>}
 */
async function generateVerifyMobileNumberToken(user: IUserDocument): Promise<string> {
    const expires = moment().add(config.jwt.verifyMobileNumberExpirationMinutes, 'minutes');
    const token = generateRandomSixDigit();
    await saveToken(token, user._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER);
    return token;
}

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
async function generateVerifyEmailToken(user: IUserDocument): Promise<string> {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const token = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
    await saveToken(token, user._id, expires, tokenTypes.VERIFY_EMAIL);
    return token;
}

export default {
    generateToken,
    verifyToken,
    generateAuthsToken,
    generateResetPasswordViaMobileNumberToken,
    generateResetPasswordViaEmailToken,
    generateVerifyMobileNumberToken,
    generateVerifyEmailToken,
    saveToken
}