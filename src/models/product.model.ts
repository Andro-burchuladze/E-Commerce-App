import { Schema, model, Model, Types } from 'mongoose';
import { toJSON } from './plugins';
import { IProductDocument, IProductModel } from '../interfaces/Product.interface';

const productSchema = new Schema<IProductDocument, IProductModel>({
    item: {
        type: String,
        trim: true,
        require: true,
        index: true,
        unique: true,
    },
    categories: [{
        type: String
    }],
    skus: [
        {
            sku: {
                type: String,
                index: true,
                unique: true,
                require: true
            },
            image: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                buy: {
                    type: Number
                },
                sell: {
                    type: Number
                },
                discount: {
                    type: Number,
                    default: 0,
                },
            },
            isAvailable: {
                type: Boolean,
                default: true
            },
            attributes: {}
        }
    ]
});

// Plugins
productSchema.plugin(toJSON);

export default model<IProductDocument, IProductModel>('Product', productSchema);
