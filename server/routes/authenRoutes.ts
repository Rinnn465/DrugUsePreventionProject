/**
 * Các route API liên quan đến xác thực.
 * Cung cấp các endpoint cho đăng nhập, đăng ký, đăng xuất và quy trình đặt lại mật khẩu.
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
 * @desc Đăng nhập người dùng
 * @access Công khai
 */
router.post("/login", login);

/**
 * @route POST /api/auth/register
 * @desc Đăng ký người dùng
 * @access Công khai
 */
router.post("/register", register);

/**
 * @route POST /api/auth/logout
 * @desc Đăng xuất người dùng
 * @access Người dùng đã xác thực
 */
router.post("/logout", logout);

/**
 * @route POST /api/auth/forgot-password
 * @desc Khởi tạo đặt lại mật khẩu (gửi email đặt lại)
 * @access Công khai
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route POST /api/auth/verify-token
 * @desc Xác minh mã đặt lại mật khẩu
 * @access Công khai
 */
router.post("/verify-token", postVerifyResetToken);

/**
 * @route POST /api/auth/reset-token
 * @desc Đặt lại mật khẩu bằng mã hợp lệ
 * @access Công khai
 */
router.post("/reset-token", resetPassword);

export default router;