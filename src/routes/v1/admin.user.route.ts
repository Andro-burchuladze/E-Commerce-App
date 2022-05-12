import express from "express";
import { validate, auth } from "../../middlewares";
import { adminUserValidation } from "../../validations";
import { adminUserController } from "../../controllers";

const router = express.Router();

// Routes
router.route('/')
    .post(auth('manageUser'), validate(adminUserValidation.createUser), adminUserController.createUser)
    .get(auth('manageUser'), validate(adminUserValidation.getUsers), adminUserController.getUsers);

// Routes
router.route('/:userId')
    .get(auth('manageUser'), validate(adminUserValidation.getUserById), adminUserController.getUserById)
    .patch(auth('manageUser'), validate(adminUserValidation.updateUserById), adminUserController.updateUserById)


export default router;