import express from "express";
import { validate } from "../../middlewares";
import { authValidation } from "../../validations";
import { authController } from "../../controllers";

const router = express.Router();

// Routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/send-verification', validate(authValidation.sendVerification), authController.sendVerification);
router.post('/verify-mobile-number', validate(authValidation.verifyMobileNumber), authController.verifyMobileNumber);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/verify-mobile-number-for-reset-password', validate(authValidation.verifyMobileNumberForResetPassword), authController.verifyMobileNumberForResetPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

export default router;