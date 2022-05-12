import httpStatus from "http-status";
import { Request, Response } from 'express';
import { authService, userService, tokenService } from '../services';
import { catchAsync } from "../utils";
import { IUserDocument } from "../interfaces/User.interface";

// Register  
const register = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail, password } = req.body;
    const user: IUserDocument = await userService.createUser(mobileNumberOrEmail, password);
    res.status(httpStatus.CREATED).send(user);
});

// Send verification  
const sendVerification = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail } = req.body;
    await authService.sendVerification(mobileNumberOrEmail);
    res.status(httpStatus.NO_CONTENT).send();
});

// Verify mobile number
const verifyMobileNumber = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumber, token } = req.body;
    const user = await authService.verifyMobileNumber(mobileNumber, token);
    res.status(httpStatus.NO_CONTENT).send();
});

// Verify email
const verifyEmail = catchAsync(async function (req: Request, res: Response) {
    const token = req.query.token as string;
    await authService.verifyEmail(token);
    res.status(httpStatus.NO_CONTENT).send();
});

// Login
const login = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail, password } = req.body;
    const user: IUserDocument = await authService.loginByMobileNumberOrEmailAndPassword(mobileNumberOrEmail, password);
    const tokens = await tokenService.generateAuthsToken(user);
    res.status(httpStatus.OK).send({ user, tokens });
});

// Logout
const logout = catchAsync(async function (req: Request, res: Response) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
});

// Refresh Tokens
const refreshTokens = catchAsync(async function (req: Request, res: Response) {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.status(httpStatus.OK).send(tokens);
    // res.send({ ...tokens });
});

// Forgot password 
const forgotPassword = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail } = req.body;
    await authService.sendResetPasswordSmsOrEmail(mobileNumberOrEmail);
    res.status(httpStatus.NO_CONTENT).send();
});


// Verify mobile number for reset password
const verifyMobileNumberForResetPassword = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumber, token } = req.body;
    const user: IUserDocument = await authService.verifyMobileNumberForResetPassword(mobileNumber, token);
    const resetPasswordToken = await tokenService.generateResetPasswordViaMobileNumberToken(user);
    res.status(httpStatus.OK).send({ resetPasswordToken });
});

// Reset password 
const resetPassword = catchAsync(async function (req: Request, res: Response) {
    const { mobileNumberOrEmail, password } = req.body;
    const { token } = req.query;
    await authService.resetPassword(mobileNumberOrEmail, password, token);
    res.status(httpStatus.NO_CONTENT).send();
});


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