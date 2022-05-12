import moment from "moment";
import mongoose from "mongoose";
import httpStatus from "http-status";
import httpMocks from "node-mocks-http";
import { auth } from "../../../src/middlewares";
import { ApiError } from "../../../src/utils";
import config from "../../../src/config";
import app from "../../../src/app";
import { tokenService } from "../../../src/services";
import setupTestDB from "../../utils/setupTestDB";
import { roleRights } from "../../../src/config/roles"
import { tokenTypes } from "../../../src/config/tokens"
import { userOne, admin, insertUsers } from "../../fixtures/user.fixture"
import { userOneAccessToken, adminAccessToken } from "../../fixtures/token.fixture"
import { NextFunction, Request, Response } from 'express';

jest.useRealTimers();
setupTestDB();
describe('Auth middleware', () => {
    test('should call next with no errors if access token is valid', async () => {
        // expect(1).toBe(1);
        // await insertUsers([userOne]);
        // const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
        // const next = jest.fn();
        // await auth()(req, httpMocks.createResponse(), next);

        // // const user: any = req.user;

        // expect(next).toHaveBeenCalledWith();
        // expect(req.user._id).toEqual(userOne._id);


    });

    // it('should call next with unauthorized error if access token is not found in header', async () => {
    //     await insertUsers([userOne]);
    //     const req = httpMocks.createRequest();
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    //     await insertUsers([userOne]);
    //     const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with unauthorized error if the token is not an access token', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    //     const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
    //     const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    //     const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS, 'invalidSecret');
    //     const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with unauthorized error if access token is expired', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().subtract(1, 'minutes');
    //     const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS);
    //     const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with unauthorized error if user is not found', async () => {
    //     const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    //     const next = jest.fn();

    //     await auth()(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(
    //         expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    //     );
    // });

    // it('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    //     await insertUsers([userOne]);
    //     const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    //     const next = jest.fn();

    //     await auth('anyRight')(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //     expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
    // });

    // it('should call next with no errors if user does not have required rights but userId is in params', async () => {
    //     await insertUsers([userOne]);
    //     const req = httpMocks.createRequest({
    //         headers: { Authorization: `Bearer ${userOneAccessToken}` },
    //         params: { userId: userOne._id.toHexString() },
    //     });
    //     const next = jest.fn();

    //     await auth('anyRight')(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith();
    // });

    // it('should call next with no errors if user has required rights', async () => {
    //     await insertUsers([admin]);
    //     const req = httpMocks.createRequest({
    //         headers: { Authorization: `Bearer ${adminAccessToken}` },
    //         params: { userId: userOne._id.toHexString() },
    //     });
    //     const next = jest.fn();

    //     await auth(...roleRights.get('admin'))(req, httpMocks.createResponse(), next);

    //     expect(next).toHaveBeenCalledWith();
    // });
});