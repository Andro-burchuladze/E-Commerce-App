import httpStatus from "http-status";
import { Types } from "mongoose";
import { Request, Response } from 'express';
import { prodcutService } from '../services';
import { catchAsync } from "../utils";
import { IProductDocument } from "../interfaces/Product.interface";
import { ApiError } from "../utils";

// Create product
const createProduct = catchAsync(async function (req: Request, res: Response) {
    const { body } = req;
    const product: IProductDocument = await prodcutService.createProduct(body);
    res.status(httpStatus.CREATED).send(product);
});


export default {
    createProduct
}