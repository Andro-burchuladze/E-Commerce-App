import request from 'supertest';
import httpStatus from 'http-status';
import moment from 'moment';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import config from '../../src/config';
import { auth } from '../../src/middlewares';
import { tokenService } from '../../src/services';
import setupTestDB from '../utils/setupTestDB';
import { User, Token } from '../../src/models';
import { tokenTypes, generateRandomSixDigit } from '../../src/config/tokens';
import { userOne, userTwo, insertUsers } from '../fixtures/user.fixture';
import { IUserDocument } from "../../src/interfaces/User.interface";

setupTestDB();

describe('Auth routes', () => {
    describe('POST /v1/auth/register', () => {
        interface user {
            mobileNumberOrEmail: string,
            password: string
        }
        let newUser: user;
        beforeEach(() => {
            newUser = {
                mobileNumberOrEmail: "09175555555",
                password: 'Pass**10',
            };
        });

        test('should return 201 and successfully register user with mobile number if request data is ok', async () => {
            const res = await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.CREATED);
            expect(res.body).not.toHaveProperty('password');
            expect(res.body).toEqual({
                id: expect.anything(),
                mobileNumber: newUser.mobileNumberOrEmail,
                role: 'user',
                isMobileNumberVerified: false,
            });

            const dbUser: IUserDocument | null = await User.findById(res.body.id);
            expect(dbUser).toBeDefined();
            expect(dbUser).toMatchObject({ mobileNumber: newUser.mobileNumberOrEmail, role: 'user', isMobileNumberVerified: false });
            if (dbUser) {
                expect(dbUser.password).not.toBe(newUser.password);
            }
        });

        test('should return 201 and successfully register user with email if request data is ok', async () => {
            newUser.mobileNumberOrEmail = "andro@gmail.com"
            const res = await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.CREATED);

            expect(res.body).not.toHaveProperty('password');
            expect(res.body).toEqual({
                id: expect.anything(),
                email: newUser.mobileNumberOrEmail,
                role: 'user',
                isEmailVerified: false,
            });

            const dbUser: IUserDocument | null = await User.findById(res.body.id);
            expect(dbUser).toBeDefined();
            expect(dbUser).toMatchObject({ email: newUser.mobileNumberOrEmail, role: 'user', isEmailVerified: false });
            if (dbUser) {
                expect(dbUser.password).not.toBe(newUser.password);
            }
        });

        test('should return 400 error if mobile number is already used', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is already used', async () => {
            await insertUsers([userTwo]);
            newUser.mobileNumberOrEmail = "andro@gmail.com";
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not send', async () => {
            await request(app)
                .post('/v1/auth/register')
                .send({
                    mobileNumberOrEmail: newUser.mobileNumberOrEmail
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password length is less than 8 characters', async () => {
            newUser.password = 'passwo1';
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not contain letter, capital letter, number or special character', async () => {
            newUser.password = '1111****';
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain any number
            newUser.password = 'Pass****';
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain special character
            newUser.password = 'Pass1010';
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain capital letter
            newUser.password = 'pass**10';
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            await request(app)
                .post('/v1/auth/register')
                .send({
                    password: newUser.password
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            newUser.mobileNumberOrEmail = "0917555"
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is not valid', async () => {
            newUser.mobileNumberOrEmail = "andro"
            await request(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

    });

    describe('POST /v1/auth/send-verification', () => {
        beforeEach(() => {
            userOne.isMobileNumberVerified = false;
            userTwo.isEmailVerified = false;
        });
        test('should return 204 and successfully send sms verification if mobile number is not verified', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: userOne.mobileNumber
                })
                .expect(httpStatus.NO_CONTENT);

            const dbToken = await Token.findOne({ user: userOne._id, type: tokenTypes.VERIFY_MOBILE_NUMBER, blacklisted: false });
            expect(dbToken).toBeDefined();

        });

        test('should return 204 and successfully send email verification if email is not verified', async () => {
            await insertUsers([userTwo]);
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: userTwo.email

                })
                .expect(httpStatus.NO_CONTENT);

            const dbToken = await Token.findOne({ user: userOne._id, type: tokenTypes.VERIFY_EMAIL, blacklisted: false });
            expect(dbToken).toBeDefined();
        });
        test('should return 400 if mobile number is already verified', async () => {
            userOne.isMobileNumberVerified = true;
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: userOne.mobileNumber
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if email is already verified', async () => {
            userTwo.isEmailVerified = true;
            await insertUsers([userTwo]);
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: userTwo.email
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 404 if there is not any user with a given mobile number', async () => {
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: '0917555'
                })
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 404 if there is not any user with a given email', async () => {
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: 'andro@gmail.com'
                })
                .expect(httpStatus.NOT_FOUND);
        });
        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            await request(app)
                .post('/v1/auth/send-verification')
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: '0917555'
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is not valid', async () => {
            await request(app)
                .post('/v1/auth/send-verification')
                .send({
                    mobileNumberOrEmail: 'andro'
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/verify-mobile-number', () => {
        test('should return 204 and verify mobile number if mobile number and token are match', async () => {
            await insertUsers([userOne]);

            let expires = moment().add(config.jwt.verifyMobileNumberExpirationMinutes, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER);

            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.NO_CONTENT);

            let dbUser: IUserDocument | null = await User.findById(userOne._id);
            if (dbUser) {
                expect(dbUser.isMobileNumberVerified).toBe(true);
            }

            const dbVerifyMobileNumberTokenDoc = await Token.findOne({ token, user: userOne._id, type: tokenTypes.VERIFY_MOBILE_NUMBER });
            expect(dbVerifyMobileNumberTokenDoc).toBe(null);
        });

        test('should return 401 if verify mobile number token is blacklisted', async () => {
            await insertUsers([userOne]);

            let expires = moment().add(config.jwt.verifyMobileNumberExpirationMinutes, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER, true);

            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if verify mobile number token is expired', async () => {
            await insertUsers([userOne]);

            let expires = moment().subtract(1, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER);

            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if there is not any user with a given mobile number', async () => {
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token: "123456"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if token is wrong', async () => {
            await insertUsers([userOne]);
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token: "123456"
                })
                .expect(httpStatus.UNAUTHORIZED);

        });

        test('should return 400 error if mobile number does not send', async () => {
            await request(app)
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    token: "123456"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await request(app)
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumberOrEmail: '0917555',
                    token: "123456"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if token does not send', async () => {
            await request(app)
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: "09175555555"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if token lenght is not 6', async () => {
            await request(app)
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    mobileNumber: "09175555555",
                    token: "1234567"

                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/verify-email', () => {
        test('should return 204 and verify the email', async () => {
            await insertUsers([userTwo]);
            const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
            const verifyEmailToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.VERIFY_EMAIL);
            await tokenService.saveToken(verifyEmailToken, userTwo._id, expires, tokenTypes.VERIFY_EMAIL);

            await request(app)
                .post('/v1/auth/verify-email')
                .query({ token: verifyEmailToken })
                .send()
                .expect(httpStatus.NO_CONTENT);

            const dbUser: IUserDocument | null = await User.findById(userTwo._id);

            if (dbUser) {
                expect(dbUser.isEmailVerified).toBe(true);
            }

            const dbVerifyEmailToken = await Token.countDocuments({
                user: userTwo._id,
                type: tokenTypes.VERIFY_EMAIL,
            });
            expect(dbVerifyEmailToken).toBe(0);
        });

        test('should return 400 if verify email token is missing', async () => {
            await request(app)
                .post('/v1/auth/verify-email')
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 401 if verify email token is blacklisted', async () => {
            await insertUsers([userTwo]);
            const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
            const verifyEmailToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.VERIFY_EMAIL);
            await tokenService.saveToken(verifyEmailToken, userTwo._id, expires, tokenTypes.VERIFY_EMAIL, true);

            await request(app)
                .post('/v1/auth/verify-email')
                .query({ token: verifyEmailToken })
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if verify email token is expired', async () => {
            await insertUsers([userTwo]);
            const expires = moment().subtract(1, 'minutes');
            const verifyEmailToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.VERIFY_EMAIL);
            await tokenService.saveToken(verifyEmailToken, userTwo._id, expires, tokenTypes.VERIFY_EMAIL);

            await request(app)
                .post('/v1/auth/verify-email')
                .query({ token: verifyEmailToken })
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if user is not found', async () => {
            const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
            const verifyEmailToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.VERIFY_EMAIL);
            await tokenService.saveToken(verifyEmailToken, userTwo._id, expires, tokenTypes.VERIFY_EMAIL);

            await request(app)
                .post('/v1/auth/verify-email')
                .query({ token: verifyEmailToken })
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });
    });

    describe('POST /v1/auth/login', () => {
        beforeEach(() => {
            userOne.isMobileNumberVerified = false;
            userTwo.isEmailVerified = false;
        });
        test('should return 200 and login user if mobile number and password match and mobile number is verified', async () => {
            userOne.isMobileNumberVerified = true;
            await insertUsers([userOne]);

            const res = await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: userOne.mobileNumber,
                    password: userOne.password
                })
                .expect(httpStatus.OK);

            expect(res.body.user).not.toHaveProperty('password');
            expect(res.body.user).toEqual({
                id: expect.anything(),
                mobileNumber: userOne.mobileNumber,
                role: 'user',
                isMobileNumberVerified: true,
            });
            expect(res.body.tokens).toEqual({
                access: { token: expect.anything(), expires: expect.anything() },
                refresh: { token: expect.anything(), expires: expect.anything() },
            });
        });

        test('should return 200 and login user if email and password match and email is verified', async () => {
            userTwo.isEmailVerified = true;
            await insertUsers([userTwo]);

            const res = await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: userTwo.email,
                    password: userTwo.password
                })
                .expect(httpStatus.OK);

            expect(res.body.user).toEqual({
                id: expect.anything(),
                email: userTwo.email,
                role: 'user',
                isEmailVerified: true,
            });

            expect(res.body.tokens).toEqual({
                access: { token: expect.anything(), expires: expect.anything() },
                refresh: { token: expect.anything(), expires: expect.anything() },
            });

        });
        test('should return 401 if mobile number is not verifed', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: userOne.mobileNumber,
                    password: userOne.password
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if email is not verfied', async () => {
            await insertUsers([userTwo]);
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: userTwo.email,
                    password: userTwo.password
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if there are no user with given mobile number', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555",
                    password: "Pa**1020"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if there are no user with given email', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "andro@yahoo.com",
                    password: "Pa**1020"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 error if password is wrong', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: userOne.mobileNumber,
                    password: "Wr**1020"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });
        test('should return 400 error if password does not send', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password length is less than 8 characters', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555",
                    password: "passwo1"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not contain letter, capital letter, number or special character', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555",
                    password: "1111****"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain any number
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555",
                    password: "Pass****"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain special character
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "09175555555",
                    password: "Pass1010"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain capital letter
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "0917555",
                    password: "pass**10"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    password: 'Pass**10'
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "0917555",
                    password: 'Pass**10'
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is not valid', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    mobileNumberOrEmail: "andro",
                    password: 'Pass**10'
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/logout', () => {
        test('should return 204 if refresh token is valid', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/logout')
                .send({ refreshToken })
                .expect(httpStatus.NO_CONTENT);

            const dbRefreshTokenDoc = await Token.findOne({ token: refreshToken });
            expect(dbRefreshTokenDoc).toBe(null);
        });

        test('should return 404 error if refresh token is not found in the database', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/logout')
                .send({ refreshToken })
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 404 error if refresh token is blacklisted', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH, true);

            await request(app)
                .post('/v1/auth/logout')
                .send({ refreshToken })
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 400 if refresh token does not send', async () => {
            await request(app)
                .post('/v1/auth/logout')
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if refresh token is invalid', async () => {
            await request(app)
                .post('/v1/auth/logout')
                .send({ refreshToken: "invalidToken" })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/refresh-tokens', () => {
        test('should return 200 and new auth tokens if refresh token is valid', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

            const res = await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                access: { token: expect.anything(), expires: expect.anything() },
                refresh: { token: expect.anything(), expires: expect.anything() },
            });

            const dbRefreshTokenDoc = await Token.findOne({ token: res.body.refresh.token });
            expect(dbRefreshTokenDoc).toMatchObject({ type: tokenTypes.REFRESH, user: userOne._id, blacklisted: false });

            const dbRefreshTokenCount = await Token.countDocuments();
            expect(dbRefreshTokenCount).toBe(1);
        });

        test('should return 401 error if refresh token is signed using an invalid secret', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH, 'invalidSecret');
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 error if refresh token is not found in the database', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 error if refresh token is blacklisted', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH, true);

            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 error if refresh token is expired', async () => {
            await insertUsers([userOne]);
            const expires = moment().subtract(1, 'minutes');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 error if user is not found', async () => {
            const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
            const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
            await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 400 if refresh token does not send', async () => {
            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if refresh token is invalid', async () => {
            await request(app)
                .post('/v1/auth/refresh-tokens')
                .send({ refreshToken: "invalidToken" })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/forgot-password', () => {
        test('should return 204 and send reset password sms', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({ mobileNumberOrEmail: userOne.mobileNumber })
                .expect(httpStatus.NO_CONTENT);

            const dbResetPasswordToken = await Token.findOne({ user: userOne._id, type: tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER, blacklisted: false });
            expect(dbResetPasswordToken).toBeDefined();
        });

        test('should return 204 and send reset password email', async () => {
            await insertUsers([userTwo]);
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({ mobileNumberOrEmail: userTwo.email })
                .expect(httpStatus.NO_CONTENT);

            const dbResetPasswordToken = await Token.findOne({ user: userTwo._id, type: tokenTypes.RESET_PASSWORD_VIA_EMAIL, blacklisted: false });
            expect(dbResetPasswordToken).toBeDefined();

        });

        test('should return 404 if mobile number does not belong to any user', async () => {
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({ mobileNumberOrEmail: userOne.mobileNumber })
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 404 if email does not belong to any user', async () => {
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({ mobileNumberOrEmail: userTwo.email })
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            await request(app)
                .post('/v1/auth/forgot-password')
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({
                    mobileNumberOrEmail: "0917555",
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is not valid', async () => {
            await request(app)
                .post('/v1/auth/forgot-password')
                .send({
                    mobileNumberOrEmail: "andro",
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/verify-mobile-number-for-reset-password', () => {
        test('should return 200 and return reset password token if mobile number and token are match', async () => {
            await insertUsers([userOne]);

            let expires = moment().add(config.jwt.verifyMobileNumberExpirationMinutes, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER);

            const res = await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                resetPasswordToken: expect.anything(),
            });

            const dbVerifyMobileNumberTokenDoc = await Token.findOne({ token, user: userOne._id, type: tokenTypes.VERIFY_MOBILE_NUMBER });
            expect(dbVerifyMobileNumberTokenDoc).toBe(null);
        });

        test('should return 401 if verify mobile number token is blacklisted', async () => {
            await insertUsers([userOne]);

            let expires = moment().add(config.jwt.verifyMobileNumberExpirationMinutes, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER, true);

            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if verify mobile number token is expired', async () => {
            await insertUsers([userOne]);

            let expires = moment().subtract(1, 'minutes');
            let token = generateRandomSixDigit();
            await tokenService.saveToken(token, userOne._id, expires, tokenTypes.VERIFY_MOBILE_NUMBER);

            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if there is not any user with a given mobile number', async () => {
            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token: "123456"
                })
                .expect(httpStatus.UNAUTHORIZED);

        });
        test('should return 401 if token is wrong', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: userOne.mobileNumber,
                    token: "123456"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });
        test('should return 400 error if mobile number does not send', async () => {
            await request(app).post('/v1/auth/verify-mobile-number')
                .send({
                    token: "123456"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumberOrEmail: '0917555',
                    token: "123456"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if token does not send', async () => {
            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: "09175555555"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if token lenght is not 6', async () => {
            await request(app)
                .post('/v1/auth/verify-mobile-number-for-reset-password')
                .send({
                    mobileNumber: "09175555555",
                    token: "1234567"
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/auth/reset-password', () => {
        test('should return 204 and reset password with mobile number', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
            await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass**50"
                })
                .expect(httpStatus.NO_CONTENT);

            const dbUser: IUserDocument | null = await User.findById(userOne._id);
            if (dbUser) {
                const isPasswordMatch = await bcrypt.compare('Pass**50', dbUser.password);
                expect(isPasswordMatch).toBe(true);
            }

            const dbResetPasswordTokenCount = await Token.countDocuments({ user: userOne._id, type: tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER });
            expect(dbResetPasswordTokenCount).toBe(0);
        });

        test('should return 204 and reset password with email', async () => {
            await insertUsers([userTwo]);
            const expires = moment().add(config.jwt.resetPasswordViaEmailExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "1",
                    password: "Pass**50"
                })
                .expect(httpStatus.NO_CONTENT);

            const dbUser: IUserDocument | null = await User.findById(userTwo._id);
            if (dbUser) {
                const isPasswordMatch = await bcrypt.compare('Pass**50', dbUser.password);
                expect(isPasswordMatch).toBe(true);
            }

            const dbResetPasswordTokenCount = await Token.countDocuments({ user: userTwo._id, type: tokenTypes.RESET_PASSWORD_VIA_EMAIL });
            expect(dbResetPasswordTokenCount).toBe(0);
        });

        test('should return 401 if reset password token is blacklisted', async () => {
            await insertUsers([userOne]);
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
            await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER, true);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass**50"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if reset password token is expired', async () => {
            await insertUsers([userOne]);
            const expires = moment().subtract(1, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
            await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass**50"
                })
                .expect(httpStatus.UNAUTHORIZED);

        });

        test('should return 400 error if reset password token not send', async () => {
            await request(app)
                .post('/v1/auth/reset-password')
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass**50"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not send', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password length is less than 8 characters', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "passwo1"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not contain letter, capital letter, number or special character', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "1111****"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain any number
            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass****"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain special character
            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass1010"
                })
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain capital letter
            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "pass**10"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    password: 'Pass**10'
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "10",
                    password: 'Pass**10'
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 401 if user is not found with given mobile number', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);
            await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "0",
                    password: "Pass**50"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 401 if user is not found with given email', async () => {
            const expires = moment().add(config.jwt.resetPasswordViaMobileNumberExpirationMinutes, 'minutes');
            const resetPasswordToken = tokenService.generateToken(userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);
            await tokenService.saveToken(resetPasswordToken, userTwo._id, expires, tokenTypes.RESET_PASSWORD_VIA_EMAIL);

            await request(app)
                .post('/v1/auth/reset-password')
                .query({ token: resetPasswordToken })
                .send({
                    mobileNumberOrEmail: "1",
                    password: "Pass**50"
                })
                .expect(httpStatus.UNAUTHORIZED);
        });

    });
});