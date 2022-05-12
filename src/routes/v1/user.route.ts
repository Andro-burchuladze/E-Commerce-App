import express from "express";
import { validate, auth } from "../../middlewares";
import { userValidation } from "../../validations";
import { userController } from "../../controllers";

const router = express.Router();

// Routes
router.route('/me')
    .get(auth('user'), userController.getUserProfile)
    .patch(auth('user'), validate(userValidation.updateUserProfile), userController.updateUserProfile);


export default router;