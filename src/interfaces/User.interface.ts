import { Document, Model, Types, Schema } from 'mongoose';

export interface IUser {
    _id?: any,
    mobileNumber?: string,
    email?: string,
    password: string,
    firstname?: string,
    lastname?: string,
    role?: string,
    isMobileNumberVerified?: boolean,
    isEmailVerified?: boolean,
    avatar?: string,
    phoneNumber?: string,
    address?: {
        country?: string,
        province?: string,
        city?: string,
        street?: string,
        zipCode?: string
    },
};

export interface IUserDocument extends IUser, Document {
    isPasswordMatch(password: string): Promise<boolean>
};
export interface IUserModel extends Model<IUserDocument> {
    isMobileNumberTaken(mobileNumber: string, excludeUserId?: Types.ObjectId): Promise<boolean>,
    isEmailTaken(email: string, excludeUserId?: Types.ObjectId): Promise<boolean>,
    paginate(filter: object, options: object): any
};

export interface IUserUpdate {
    mobileNumber?: string,
    email?: string,
    password?: string,
    firstname?: string,
    lastname?: string,
    role?: string,
    isMobileNumberVerified?: boolean,
    isEmailVerified?: boolean,
    avatar?: string,
    phoneNumber?: string,
    address?: {
        country?: string,
        province?: string,
        city?: string,
        street?: string,
        zipCode?: string
    },
};