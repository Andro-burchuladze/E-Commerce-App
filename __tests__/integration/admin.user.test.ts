import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { User } from '../../src/models';
import { userOne, userTwo, admin, insertUsers, userThree } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { IUserDocument } from "../../src/interfaces/User.interface";

setupTestDB();

describe('Admin/users routes', () => {
    describe('POST /v1/admin/users', () => {
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
        test('should return 201 and successfully create user with mobile number if request data is ok', async () => {
            await insertUsers([admin]);
            const res = await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
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

        test('should return 201 and successfully create user with email if request data is ok', async () => {
            await insertUsers([admin]);
            newUser.mobileNumberOrEmail = "behzadrabiei@gmail.com"
            const res = await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
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


        test('should return 401 if access token is missing', async () => {
            await insertUsers([admin]);
            await request(app)
                .post('/v1/admin/users')
                .send(newUser)
                .expect(httpStatus.UNAUTHORIZED);
        });


        test('should return 403 error if non-admin user try to access this resource', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newUser)
                .expect(httpStatus.FORBIDDEN);
        });

        test('should return 400 error if mobile number is already used', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is already used', async () => {
            await insertUsers([userTwo, admin]);
            newUser.mobileNumberOrEmail = "behzad.rabiei.77@gmail.com";
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not send', async () => {
            await insertUsers([admin]);
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    mobileNumberOrEmail: newUser.mobileNumberOrEmail
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password length is less than 8 characters', async () => {
            await insertUsers([admin]);
            newUser.password = 'passwo1';
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if password does not contain letter, capital letter, number or special character', async () => {
            await insertUsers([admin]);
            newUser.password = '1111****';
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain any number
            newUser.password = 'Pass****';
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain special character
            newUser.password = 'Pass1010';
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);

            // If password does not contain capital letter
            newUser.password = 'pass**10';
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobileNumberOrEmail does not send', async () => {
            await insertUsers([admin]);
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    password: newUser.password
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if mobile number is not valid', async () => {
            await insertUsers([admin]);
            newUser.mobileNumberOrEmail = "0913413"
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if email is not valid', async () => {
            await insertUsers([admin]);
            newUser.mobileNumberOrEmail = "behzad"
            await request(app)
                .post('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(httpStatus.BAD_REQUEST);
        });
    });
    describe('GET /v1/admin/users', () => {

        test('should return 200 and apply the default query options', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0]).toEqual({
                id: expect.anything(),
                mobileNumber: userThree.mobileNumber,
                role: 'user',
                isMobileNumberVerified: userThree.isMobileNumberVerified,
            });
        });

        test('should return 200 and apply filter on mobileNumber field', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ mobileNumber: userThree.mobileNumber })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userThree._id.toHexString());
        });

        test('should return 200 and apply filter on email field', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ email: userTwo.email })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userTwo._id.toHexString());
        });

        test('should return 200 and apply filter on firstname field', async () => {
            userOne.firstname = 'Behzad'
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ firstname: userOne.firstname })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userOne._id.toHexString());
        });

        test('should return 200 and apply filter on lastname field', async () => {
            userTwo.lastname = 'Behzad'
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ lastname: userTwo.lastname })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userTwo._id.toHexString());
        });

        test('should return 200 and apply filter on isMobileNumberVerified field', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ isMobileNumberVerified: userOne.isMobileNumberVerified })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userOne._id.toHexString());
        });

        test('should return 200 and apply filter on isEmailVerified field', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ isEmailVerified: userTwo.isEmailVerified })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userTwo._id.toHexString());

        });

        test('should return 200 and apply filter on phoneNumber field', async () => {
            userThree.phoneNumber = '03145850251'
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ phoneNumber: userThree.phoneNumber })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userThree._id.toHexString());
        });

        test('should return 200 and correctly sort the returned array if descending sort param is specified', async () => {
            userOne.firstname = 'Behzad';
            userTwo.firstname = 'Saied';
            userThree.firstname = 'Nima';
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ sortBy: 'firstname:desc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].id).toBe(userTwo._id.toHexString());
            expect(res.body.results[1].id).toBe(userThree._id.toHexString());
            expect(res.body.results[2].id).toBe(userOne._id.toHexString());
        });

        test('should return 200 and correctly sort the returned array if ascending sort param is specified', async () => {
            userOne.firstname = 'Behzad';
            userTwo.firstname = 'Saied';
            userThree.firstname = 'Nima';
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ sortBy: 'firstname:asc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].id).toBe(userOne._id.toHexString());
            expect(res.body.results[1].id).toBe(userThree._id.toHexString());
            expect(res.body.results[2].id).toBe(userTwo._id.toHexString());
        });
        test('should return 200 and correctly sort the returned array if multiple sorting criteria are specified', async () => {
            userOne.firstname = 'Behzad';
            userTwo.firstname = 'Behzad';
            userThree.firstname = 'Nima';
            userOne.lastname = 'Rabiei';
            userTwo.lastname = 'Zare';
            userThree.lastname = 'Rafiei';
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ sortBy: 'firstname:asc,lastname:desc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            // TODO: CHECK BOIL
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].id).toBe(userTwo._id.toHexString());
            expect(res.body.results[1].id).toBe(userOne._id.toHexString());
            expect(res.body.results[2].id).toBe(userThree._id.toHexString());
        });

        test('should return 200 and limit returned array if limit param is specified', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ limit: 2 })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 2,
                totalPages: 2,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(2);
            expect(res.body.results[0].id).toBe(userThree._id.toHexString());
            expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
        });

        test('should return 200 and the correct page if page and limit params are specified', async () => {
            await insertUsers([userOne]);
            await insertUsers([userTwo]);
            await insertUsers([userThree, admin]);

            const res = await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ limit: 2, page: 2 })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 2,
                limit: 2,
                totalPages: 2,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(userOne._id.toHexString());
        });

        test('should return 401 if access token is missing', async () => {
            await insertUsers([admin]);
            await request(app)
                .get('/v1/admin/users')
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 403 error if non-admin user try to access this resource', async () => {
            await insertUsers([userOne]);
            await request(app)
                .get('/v1/admin/users')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.FORBIDDEN);
        });
    });
    describe('GET /v1/admin/users/:userId', () => {
        test('should return 200 and user object if request data is ok', async () => {
            await insertUsers([userOne, admin]);
            const res = await request(app)
                .get(`/v1/admin/users/${userOne._id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                id: expect.anything(),
                mobileNumber: userOne.mobileNumber,
                role: 'user',
                isMobileNumberVerified: userOne.isMobileNumberVerified,
                firstname: 'Behzad',
                lastname: 'Rabiei'
            });
        });
        test('should return 400 if given userId is not valid mongoose objectId', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .get('/v1/admin/users/abcdef')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);

        });
        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .get(`/v1/admin/users/${userOne._id}`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });
        test('should return 403 if non-admin user try to access this resource', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .get(`/v1/admin/users/${userTwo._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.FORBIDDEN);
        });
        test('should return 404 if did not find any user with given userId', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .get(`/v1/admin/users/${userTwo._id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('PATCH /v1/admin/users/userId', () => {
        interface updateInterface {
            isMobileNumberVerified: boolean,
            firstname: string,
            lastname: string,
            mobileNumber?: string,
            email?: string,
        }
        let updateBody: updateInterface;
        beforeEach(() => {
            updateBody = {
                isMobileNumberVerified: true,
                firstname: 'Haj',
                lastname: 'Kerim',
                mobileNumber: "09134138833",
                email: "behzad@gmail.com",
            };
        });
        test('should return 200 and successfully update user if request data is ok', async () => {
            await insertUsers([userOne, admin]);
            const res = await request(app)
                .patch(`/v1/admin/users/${userOne._id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                id: expect.anything(),
                mobileNumber: updateBody.mobileNumber,
                role: 'user',
                isMobileNumberVerified: false,
                isEmailVerified: false,
                firstname: updateBody.firstname,
                lastname: updateBody.lastname,
                email: updateBody.email,
            });

            const dbUser = await User.findById(res.body.id);
            expect(dbUser).toBeDefined();
            expect(dbUser).toMatchObject({
                mobileNumber: updateBody.mobileNumber,
                role: 'user',
                isMobileNumberVerified: false,
                isEmailVerified: false,
                firstname: updateBody.firstname,
                lastname: updateBody.lastname,
                email: updateBody.email,
            });

        });
        test('should return 400 if admin try to update not allowed filed', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .patch(`/v1/admin/users/${userOne._id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({ ...updateBody, role: "admin" })
                .expect(httpStatus.BAD_REQUEST);
        });
        test('should return 400 if given userId is not valid mongoose objectId', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .patch(`/v1/admin/users/abcdse`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });
        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .patch(`/v1/admin/users/${userOne._id}`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });
        test('should return 403 if non-admin user try to access this resource', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .patch(`/v1/admin/users/${userOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.FORBIDDEN);
        });
        test('should return 404 if did not find any user with given userId', async () => {
            await insertUsers([userOne, admin]);
            await request(app)
                .patch(`/v1/admin/users/${userTwo._id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });
    });
});