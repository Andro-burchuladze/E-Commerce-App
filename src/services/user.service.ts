import httpStatus from "http-status";
import { User } from "../models";
import { IUser, IUserDocument, IUserUpdate } from "../interfaces/User.interface";
import { ApiError, pick } from "../utils";
import { mobileNumberRegex } from "../config/regex";
import { Types } from "mongoose";


/**
 * Create a user via mobile number or email
 * @param {String} mobileNumberOrEmail
 * @param {String} password
 * @returns {Promise<IUserDocument>}
 */
async function createUser(mobileNumberOrEmail: string, password: string): Promise<IUserDocument> {
    let user: IUserDocument;
    if (mobileNumberOrEmail.match(mobileNumberRegex)) {
        user = await createUserWithMobileNumber(mobileNumberOrEmail, password);
    } else {
        user = await createUserWithEmail(mobileNumberOrEmail, password);
    }
    return user;
};

/** create a user with mobile numbber
 * @param {String} mobileNumber
 * @param {String} password
 * @returns {Promise<IUserDocument>}
 */
async function createUserWithMobileNumber(mobileNumber: string, password: string): Promise<IUserDocument> {
    if (await User.isMobileNumberTaken(mobileNumber)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile number is already used');
    }
    const user: IUser = {
        mobileNumber,
        password,
        isMobileNumberVerified: false
    };
    return User.create(user);
}

/**
 * Create a user with email
 * @param {String} email
 * @param {String} password
 * @returns {Promise<IUserDocument>}
 */
async function createUserWithEmail(email: string, password: string): Promise<IUserDocument> {
    if (await User.isEmailTaken(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already used');
    }
    const user: IUser = {
        email,
        password,
        isEmailVerified: false
    };
    return User.create(user);
}
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<IUserDocument>}
 */
async function getUserById(id: Types.ObjectId): Promise<IUserDocument | null> {
    const user: IUserDocument | null = await User.findById(id);
    return user;
};

/**
 * Get user by mobile number
 * @param {ObjectId} mobileNumber
 * @returns {Promise<User>}
 */
async function getUserByMobileNumber(mobileNumber: string): Promise<IUserDocument | null> {
    const user: IUserDocument | null = await User.findOne({ mobileNumber });
    return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
async function getUserByEmail(email: string): Promise<IUserDocument | null> {
    const user: IUserDocument | null = await User.findOne({ email });
    return user;
}
/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {IUserUpdateBody} updateBody
 * @returns {Promise<User>}
 */
async function updateUserById(userId: Types.ObjectId, updateBody: IUserUpdate): Promise<IUserDocument | null> {
    const user: IUserDocument | null = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Did not find the user');
    }
    if (updateBody.mobileNumber && updateBody.mobileNumber !== user.mobileNumber) {
        updateBody.isMobileNumberVerified = false;
    }
    if (updateBody.email && updateBody.email !== user.email) {
        updateBody.isEmailVerified = false;
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

/**
 * Query Analyses
 * @param {Object} query 
 * @returns 
 */
async function queryUsers(query: object) {
    const filter = pick(query, ['mobileNumber', 'email', 'firstname', 'lastname', '_id', 'role', 'isMobileNumberVerified', 'isEmailVerified', 'phoneNumber']);
    const options = pick(query, ['sortBy', 'limit', 'page', 'select']);
    return User.paginate(filter, options);
}

export default {
    createUser,
    createUserWithMobileNumber,
    createUserWithEmail,
    getUserById,
    getUserByMobileNumber,
    getUserByEmail,
    updateUserById,
    queryUsers
}