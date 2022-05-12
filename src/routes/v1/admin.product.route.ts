import express from "express";
import { validate, auth } from "../../middlewares";
import { adminProductValidation } from "../../validations";
import { adminProductController } from "../../controllers";

const router = express.Router();

// Routes
router.route('/')
    .post(auth('manageUser'), validate(adminProductValidation.createProduct), adminProductController.createProduct)


export default router;