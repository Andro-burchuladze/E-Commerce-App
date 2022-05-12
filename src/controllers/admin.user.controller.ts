import httpStatus from "http-status";
import { Types } from "mongoose";
import { Request, Response } from 'express';
import { authService, userService, tokenService } from '../services';
import { catchAsync } from "../utils";
import { IUserDocument } from "../interfaces/User.interface";
import { ApiError } from "../utils";

// Create user
const createUser = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail, password } = req.body;
    const user: IUserDocument = await userService.createUser(mobileNumberOrEmail, password);
    res.status(httpStatus.CREATED).send(user);
});

// Get users
const getUsers = catchAsync(async function (req: Request, res: Response) {
    const user: any = req.user;
    const query = {
        ...req.query as object,
        _id: { $ne: [user._id] },
    };
    const users = await userService.queryUsers(query);
    res.status(httpStatus.OK).send(users);
});

// Get user by id
const getUserById = catchAsync(async function (req: Request, res: Response) {
    const userId = req.params.userId;
    const user = await userService.getUserById(new Types.ObjectId(userId));
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'کاربر مورد نظر پیدا نشد');
    }
    res.status(httpStatus.OK).send(user);
});

// Update user by id
const updateUserById = catchAsync(async function (req: Request, res: Response) {
    const userId = req.params.userId;
    const user = await userService.updateUserById(new Types.ObjectId(userId), req.body);
    res.status(httpStatus.OK).send(user);
});

export default {
    createUser,
    getUsers,
    getUserById,
    updateUserById
}