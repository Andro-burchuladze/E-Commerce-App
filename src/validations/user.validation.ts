import Joi from "joi";
import { phoneNumberRegex, mobileNumberRegex } from "../config/regex";


// update user profile
const updateUserProfile = {
    body: Joi.object().required().keys({
        mobileNumber: Joi.string().regex(mobileNumberRegex),
        email: Joi.string().email(),
        firstname: Joi.string().min(3).max(46),
        lastname: Joi.string().min(3).max(46),
        avatar: Joi.string(),
        phoneNumber: Joi.string().regex(phoneNumberRegex),
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
    updateUserProfile
}