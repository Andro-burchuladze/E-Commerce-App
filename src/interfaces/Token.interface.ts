import { Types, Document, Model } from 'mongoose';
import { IUserDocument } from './User.interface';

export interface IToken {
    token: string,
    user: Types.ObjectId | Record<string, unknown>,
    type: string,
    expires: Date,
    blacklisted?: boolean
};

export interface ITokenDocument extends IToken, Document {
    user: IUserDocument['_id']
};

export interface ITokenPopulatedDocument extends ITokenDocument {
    user: IUserDocument
}

export interface ITokenModel extends Model<ITokenDocument> { };


