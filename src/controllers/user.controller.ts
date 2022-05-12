import httpStatus from "http-status";
import { Request, Response } from 'express';
import { authService, userService, tokenService } from '../services';
import { catchAsync } from "../utils";
import { IUser, IUserDocument } from "../interfaces/User.interface";

// Get user profile  
const getUserProfile = catchAsync(async function (req: Request, res: Response) {
    const { user } = req;
    res.status(httpStatus.OK).send(user);
});

// Update user profile
const updateUserProfile = catchAsync(async function (req: Request, res: Response) {
    let user: any = req.user;
    user = await userService.updateUserById(user._id, req.body);
    res.status(httpStatus.OK).send(user);
});


export default {
    getUserProfile,
    updateUserProfile,
}