/**
 * Authentication-related API routes.
 * Provides endpoints for user login, registration, logout, and password reset flows.
 *
 * @module routes/authenRoutes
 */
import express, { Router } from "express";
import { 
    login, 
    register, 
    logout, 
    forgotPassword, 
    postVerifyResetToken, 
    resetPassword,
} from "../controllers/authenController";

// Create router
const router: Router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /api/auth/register
 * @desc User registration
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Authenticated users
 */
router.post("/logout", logout);

/**
 * @route POST /api/auth/forgot-password
 * @desc Initiate password reset (send reset email)
 * @access Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route POST /api/auth/verify-token
 * @desc Verify password reset token
 * @access Public
 */
router.post("/verify-token", postVerifyResetToken);

/**
 * @route POST /api/auth/reset-token
 * @desc Reset password using a valid reset token
 * @access Public
 */
router.post("/reset-token", resetPassword);

export default router;