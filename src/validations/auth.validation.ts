import Joi from "joi";
import { mobileNumberRegex, passwordRegex, jwtTokenRegex } from "../config/regex";


// Register
const register = {
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.alternatives().required().try(
            Joi.string().required().regex(mobileNumberRegex),
            Joi.string().required().email(),
        ),
        password: Joi.string().required().regex(passwordRegex)
    })
};

// Send verification
const sendVerification = {
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.alternatives().required().try(
            Joi.string().required().regex(mobileNumberRegex),
            Joi.string().required().email(),
        )
    })
};

// Verify mobile number
const verifyMobileNumber = {
    body: Joi.object().required().keys({
        mobileNumber: Joi.string().required().regex(mobileNumberRegex),
        token: Joi.string().length(6).required()
    })
};

// Verify email
const verifyEmail = {
    query: Joi.object().required().keys({
        token: Joi.string().required()
    })
};


// Login
const login = {
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.alternatives().required().try(
            Joi.string().required().regex(mobileNumberRegex),
            Joi.string().required().email(),
        ),
        password: Joi.string().required().regex(passwordRegex)
    })
};

// Logout
const logout = {
    body: Joi.object().required().keys({
        refreshToken: Joi.string().required().regex(jwtTokenRegex)
    })
};

// Refresh tokens
const refreshTokens = {
    body: Joi.object().required().keys({
        refreshToken: Joi.string().required().regex(jwtTokenRegex)
    })
};

// Forgot password
const forgotPassword = {
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.alternatives().required().try(
            Joi.string().required().regex(mobileNumberRegex),
            Joi.string().required().email(),
        )
    })
};

// Verify mobile number for reset password
const verifyMobileNumberForResetPassword = {
    body: Joi.object().required().keys({
        mobileNumber: Joi.string().required().regex(mobileNumberRegex),
        token: Joi.string().length(6).required()
    })
};

// Reset password
const resetPassword = {
    query: Joi.object().required().keys({
        token: Joi.string().required()
        ,
    }),
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.string().valid("0", "1").required(),
        password: Joi.string().required().regex(passwordRegex)
    })
};

export default {
    register,
    sendVerification,
    verifyMobileNumber,
    verifyEmail,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    verifyMobileNumberForResetPassword,
    resetPassword,
}