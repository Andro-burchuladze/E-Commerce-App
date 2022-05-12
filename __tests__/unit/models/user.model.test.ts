import { IUser } from '../../../src/interfaces/User.interface';
import { User } from '../../../src/models';

describe('User model', () => {
    describe('User validation', () => {
        let userWithEmail: IUser;
        let userWithMobileNumber: IUser;
        beforeEach(() => {
            userWithEmail = {
                email: "andro@yahoo.com",
                password: 'Pass**10',
            };
            userWithMobileNumber = {
                mobileNumber: "09175555555",
                password: 'Pass**10',
            };
        });

        test('should correctly validate a valid user', async () => {
            await expect(new User(userWithEmail).validate()).resolves.toBeUndefined();
        });

        test('should throw a validation error if email is invalid', async () => {
            userWithEmail.email = 'invalidEmail';
            await expect(new User(userWithEmail).validate()).rejects.toThrow();
        });

        test('should throw a validation error if mobile number is invalid', async () => {
            userWithMobileNumber.mobileNumber = '12345678911';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });

        test('should throw a validation error if password length is less than 8 characters', async () => {
            userWithMobileNumber.password = 'passwo1';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });

        test('should throw a validation error if password does not contain numbers', async () => {
            userWithMobileNumber.password = 'password';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });

        test('should throw a validation error if password does not contain letters', async () => {
            userWithMobileNumber.password = '11111111';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });

        test('should throw a validation error if password does not contain any capital letters', async () => {
            userWithMobileNumber.password = 'password*1';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });

        test('should throw a validation error if password does not contain any special character', async () => {
            userWithMobileNumber.password = 'Password20';
            await expect(new User(userWithMobileNumber).validate()).rejects.toThrow();
        });
    });

    describe('User toJSON()', () => {
        let userWithEmail: any;
        let userWithMobileNumber: any;
        beforeEach(() => {
            userWithEmail = {
                email: "andro@yahoo.com",
                password: 'Pass**10',
            };
            userWithMobileNumber = {
                mobileNumber: "09175555555",
                password: 'Pass**10',
            };
        });
        test('should not return user password when toJSON is called', () => {
            userWithMobileNumber = {
                mobileNumber: "09175555555",
                password: 'Pass**10'
            };
            expect(new User(userWithMobileNumber).toJSON()).not.toHaveProperty('password');
        });
    });
});