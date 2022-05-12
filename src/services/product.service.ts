import httpStatus from "http-status";
import { Product } from "../models";
import { IProduct, IProductDocument } from "../interfaces/Product.interface";
import { ApiError, pick } from "../utils";
import { Types } from "mongoose";



/** create product
 * @param {Object} body
 * @returns {Promise<IProductDocument>}
 */
async function createProduct(body: object): Promise<IProductDocument> {
    return Product.create(body);
}

export default {
    createProduct
}