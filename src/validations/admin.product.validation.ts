import Joi from "joi";
import { objectId } from './custom.validation';

// Create product
const createProduct = {
    body: Joi.object().required().keys({
        item: Joi.string().required(),
        categories: Joi.array().items(Joi.string()),
        skus: Joi.array().unique((a, b) => a.sku === b.sku).items(Joi.object().keys({
            sku: Joi.string().required(),
            image: Joi.string(),
            quantity: Joi.number().required(),
            price: Joi.object().keys({
                buy: Joi.number(),
                sell: Joi.number(),
                discount: Joi.number(),
            }),
            attributes: Joi.object()
        }))

    })
};


export default {
    createProduct
}