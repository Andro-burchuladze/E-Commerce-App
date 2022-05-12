import { Types } from 'mongoose'

export function objectId(value: any, helpers: any) {
    if (!Types.ObjectId.isValid(value)) {
        return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    return value;
}

