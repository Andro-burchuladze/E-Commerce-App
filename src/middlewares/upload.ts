import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { IUserDocument } from "../interfaces/User.interface";

//TODO: change any types

// Setup upload with multer
const upload = (fileType: any) => {
    const { acceptableExts, maxSize, error, dir } = fileType;
    // Storage
    const storage = multer.diskStorage({
        destination: (req: any, file, cb) => {
            // Specify destentaion folder
            const dest = `./uploads/${dir}/${req.user._id}`;
            // TODO: check existsync
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            cb(null, dest);

        },
        filename: (req, file, cb) => {
            const { originalname } = file;
            cb(null, 'temp' + "." + originalname.split(".")[1]);
        },
    });

    // FileFilter
    const fileFilter = (req: Request, file: any, cb: any) => {
        const ext = (path.extname(file.originalname)).toLowerCase();
        let isAccepted = false;
        // If extentation file was one of the acceptable extstions, file will save
        acceptableExts.forEach((accExt: any) => {
            if (accExt === ext) {
                isAccepted = true;
                cb(null, true);
            }
        });
        if (!isAccepted) {
            cb(error);
        }
    };

    // Limtits
    const limits = { fileSize: maxSize };

    // Return upload
    return multer({ storage, fileFilter, limits });
}

export default upload;
