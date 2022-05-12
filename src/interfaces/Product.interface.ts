import { Document, Model, Types, Schema } from 'mongoose';

export interface ISku {
    sku: string,
    image?: string,
    quantity?: number,
    price?: {
        buy: number,
        sell: number,
        discount: number,
    },
    isAvailable?: boolean,
    attributes?: Object
}
export interface IProduct {
    _id?: any,
    item: string,
    categories?: Array<string>,
    skus?: Array<ISku>,
};

export interface IProductDocument extends IProduct, Document { };

export interface IProductModel extends Model<IProductDocument> {
    paginate(filter: object, options: object): any
};
