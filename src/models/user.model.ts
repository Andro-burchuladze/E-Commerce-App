import { Schema, model, Model, Types } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { roles } from '../config/roles';
import { toJSON, paginate } from './plugins';
import { IUserDocument, IUserModel, } from '../interfaces/User.interface';
import { mobileNumberRegex, passwordRegex, phoneNumberRegex } from "../config/regex";


const userSchema = new Schema<IUserDocument, IUserModel>({
    // TODO: uniqe and index
    mobileNumber: {
        type: String,
        trim: true,
        validate: mobileNumberRegex
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value: string) {
            if (!validator.isEmail(value))
                throw new Error('Email Address is not valid');
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate: passwordRegex,
        private: true, // used by the toJSON plugin
    },
    firstname: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 46
    },
    lastname: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 46
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    },
    isMobileNumberVerified: {
        type: Boolean,
    },
    isEmailVerified: {
        type: Boolean,
    },
    avatar: {
        type: String
    },
    address: {
        type: {
            country: {
                type: String,
                default: "Georgia",
                maxlength: 30
            },
            province: {
                type: String,
                require: true,
                maxlength: 35
            },
            city: {
                type: String,
                require: true,
                maxlength: 35
            },
            street: {
                type: String,
                require: true,
                maxlength: 35
            },
            zipCode: {
                type: String,
                require: true,
                length: 10
            }
        }
    },
    phoneNumber: {
        type: String,
        validate: phoneNumberRegex
    }
}, { timestamps: true });

// Plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if mobile number is taken
 * @param {string} mobileNumber - The user's mobileNumber
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isMobileNumberTaken = async function (this: Model<IUserDocument>, mobileNumber: string, excludeUserId?: Types.ObjectId): Promise<boolean> {
    const user = await this.findOne({ mobileNumber, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (this: Model<IUserDocument>, email: string, excludeUserId?: Types.ObjectId): Promise<boolean> {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (this: IUserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.pre<IUserDocument>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

export default model<IUserDocument, IUserModel>('User', userSchema);
