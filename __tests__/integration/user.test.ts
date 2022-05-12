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
import { userOne, userTwo, insertUsers, admin } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { IUserDocument } from "../../src/interfaces/User.interface";

setupTestDB();

describe('Auth routes', () => {
    describe('GET /v1/users/me', () => {
        test('should return 200 and return user object if data is ok', async () => {
            await insertUsers([userOne]);

            const res = await request(app)
                .get('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).not.toHaveProperty('password');
            expect(res.body).toEqual({
                id: expect.anything(),
                mobileNumber: userOne.mobileNumber,
                role: 'user',
                isMobileNumberVerified: false,
            });
        });

        test('should return 403 if admin try to access this api', async () => {
            await insertUsers([admin]);

            await request(app)
                .get('/v1/users/me')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.FORBIDDEN);
        });
    });
    describe('PATCH /v1/users/me', () => {
        interface updateInterface {
            firstname?: string,
            lastname?: string,
            avatar?: string,
            phoneNumber?: string
            address?: {
                country: string,
                province?: string,
                city?: string,
                street?: string,
                zipCode?: string
            },
            mobileNumber?: string,
            email?: string,
        }
        let updateBody: updateInterface;
        beforeEach(() => {
            updateBody = {
                firstname: 'Andro',
                lastname: 'Burchuladze',
                mobileNumber: "09175555555",
                email: "andro@gmail.com",
                avatar: "path",
                address: {
                    country: "Gorgia"
                },
                phoneNumber: "03145850251",
            };
        });
        test('should return 200 and successfully update user if data is ok', async () => {
            await insertUsers([userOne]);
            const res = await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.OK);

            expect(res.body).not.toHaveProperty('password');
            expect(res.body).toEqual({
                id: userOne._id.toHexString(),
                role: 'user',
                isMobileNumberVerified: false,
                isEmailVerified: false,
                firstname: 'Andro',
                lastname: 'Burchuladze',
                mobileNumber: "09175555555",
                email: "andro@gmail.com",
                avatar: "path",
                address: {
                    _id: expect.anything(),
                    country: "Gorgia",
                },
            });

            const dbUser: IUserDocument | null = await User.findById(userOne._id);
            expect(dbUser).toBeDefined();
            expect(dbUser).toMatchObject({
                role: 'user',
                isMobileNumberVerified: false,
                isEmailVerified: false,
                firstname: 'Andro',
                lastname: 'Burchuladze',
                mobileNumber: "09175555555",
                email: "adnro@gmail.com",
                avatar: "path",
                address: {
                    country: "Gorgia",
                },
            })
        })
        test('should return 403 if admin try to access this api', async () => {
            await insertUsers([admin]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.FORBIDDEN);
        });

        test('should return 400 if user try to update not allowed filed', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ role: "admin" })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if mobile number is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    mobileNumber: "09175555555"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if email is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    email: "email"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if firstname is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    firstname: 123
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if lastname is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    lastname: "na"
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if avatar is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    avatar: 123
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if phone number is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    phoneNumber: "055521"
                })
                .expect(httpStatus.BAD_REQUEST);
        });
        test('should return 400 if address is not valid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch('/v1/users/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    address: {
                        what: "?"
                    }
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });


});
