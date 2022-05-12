import { Types } from "mongoose"
import { Token } from '../../../src/models';
import { IToken } from '../../../src/interfaces/Token.interface';


describe('Token model', () => {
    describe('Token validation', () => {
        let newToken: IToken;
        beforeEach(() => {
            newToken = {
                user: new Types.ObjectId(),
                token: "716384",
                type: "access",
                expires: new Date()
            };
        });

        it('should correctly validate a valid token', async () => {
            await expect(new Token(newToken).validate()).resolves.toBeUndefined();
        });

        it('should throw a validation error if type is invalid', async () => {
            newToken.type = 'invalidToken';
            await expect(new Token(newToken).validate()).rejects.toThrow();
        });

    });
});