
import sharp from "sharp";
import fs from "fs";
import path from "path";
import httpStatus from "http-status";
import { uuid } from "uuidv4";
import { ApiError } from "../utils";
import { Request, Response, NextFunction } from "express";
// const { v4: uuid_v4 } = require('uuid');


// Image compression
const imageCompression = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { file } = req;
        if (file) {
            const imagePath = (path.resolve(file.destination, file.filename));
            const splitImagePath = imagePath.split('temp');
            const newPath = splitImagePath[0] + uuid() + splitImagePath[1]

            sharp.cache(false);
            await sharp(imagePath)
                .toFormat("jpeg", { mozjpeg: true })
                .toFile(newPath);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Can not delete original image');
                }
            });
            file.path = newPath;
            next();
            return;
        }
        else {
            next();
            return
        }


    } catch (err) {
        next(err);
    }
};

export default imageCompression;



