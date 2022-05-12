import { Schema, model, Model, Types } from 'mongoose';
import { toJSON } from './plugins';
import { tokenTypes } from '../config/tokens';
import { ITokenDocument, ITokenModel } from '../interfaces/Token.interface';


const tokenSchema = new Schema<ITokenDocument, ITokenModel>(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        user: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: [tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD_VIA_MOBILE_NUMBER, tokenTypes.RESET_PASSWORD_VIA_EMAIL, tokenTypes.VERIFY_MOBILE_NUMBER, tokenTypes.VERIFY_EMAIL],
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true });

// Plugins
tokenSchema.plugin(toJSON);

export default model<ITokenDocument, ITokenModel>('Token', tokenSchema);
