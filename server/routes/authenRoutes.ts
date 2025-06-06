import express, { Router } from "express";
import * as authenController from "../controllers/authenController";

const router: Router = express.Router();

router.post("/register", authenController.register);
router.post("/login", authenController.login);
router.post("/logout", authenController.logout);

router.get("/forgot-password", authenController.showForgotPasswordForm);
router.post("/forgot-password", authenController.forgotPassword);
router.get("/reset-password/:token", authenController.showResetPasswordForm);
router.post("/reset-password/:token", authenController.resetPassword);

export default router;
