import { Types } from "mongoose"
import bcrypt from "bcryptjs"
import { User } from "../../src/models";
import { IUser } from "../../src/interfaces/User.interface";

const password = 'Pass**10';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);


export const userOne: IUser = {
    _id: new Types.ObjectId(),
    mobileNumber: "09175555555",
    password,
    isMobileNumberVerified: false,
    role: 'user',
};

export const userTwo: IUser = {
    _id: new Types.ObjectId(),
    email: "andro@gmail.com",
    password,
    isEmailVerified: false,
    role: 'user'
};

export const userThree: IUser = {
    _id: new Types.ObjectId(),
    mobileNumber: "09176666666",
    password,
    isMobileNumberVerified: true,
    role: 'user'
};

export const admin: IUser = {
    _id: new Types.ObjectId(),
    email: "burchuladze@yahoo.com",
    password,
    role: 'admin',
};

export const insertUsers = async function <Type>(users: Array<Type>) {
    await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};
