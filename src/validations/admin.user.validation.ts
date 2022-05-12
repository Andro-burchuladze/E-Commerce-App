import Joi from "joi";
import { mobileNumberRegex, passwordRegex, jwtTokenRegex, phoneNumberRegex } from "../config/regex";
import { objectId } from './custom.validation';

// Create user
const createUser = {
    body: Joi.object().required().keys({
        mobileNumberOrEmail: Joi.alternatives().required().try(
            Joi.string().required().regex(mobileNumberRegex),
            Joi.string().required().email(),
        ),
        password: Joi.string().required().regex(passwordRegex)
    })
};

// Get users
const getUsers = {
    query: Joi.object().keys({
        mobileNumber: Joi.string().regex(mobileNumberRegex),
        email: Joi.string().email(),
        firstname: Joi.string().min(3).max(46),
        lastname: Joi.string().min(3).max(46),
        isMobileNumberVerified: Joi.boolean(),
        isEmailVerified: Joi.boolean(),
        phoneNumber: Joi.string().regex(phoneNumberRegex),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    })
};

// Get user by id
const getUserById = {
    params: Joi.object().required().keys({
        userId: Joi.string().required().custom(objectId)
    })
};

// update user profile
const updateUserById = {
    params: Joi.object().required().keys({
        userId: Joi.string().required().custom(objectId)
    }),
    body: Joi.object().required().keys({
        mobileNumber: Joi.string().regex(mobileNumberRegex),
        email: Joi.string().email(),
        firstname: Joi.string().min(3).max(46),
        lastname: Joi.string().min(3).max(46),
        avatar: Joi.string(),
        phoneNumber: Joi.string().regex(phoneNumberRegex),
        isMobileNumberVerified: Joi.boolean(),
        isEmailVerified: Joi.boolean(),
        address: Joi.object().keys({
            country: Joi.string().max(35),
            province: Joi.string().max(35),
            city: Joi.string().max(35),
            street: Joi.string().max(35),
            zipCode: Joi.string().max(10)
        })

    })
};

export default {
    createUser,
    getUsers,
    getUserById,
    updateUserById
}