/**
 * Các route API liên quan đến tài khoản.
 * Cung cấp các endpoint để tạo, cập nhật và quản lý tài khoản, hồ sơ người dùng.
 *
 * @module routes/accountRoutes
 */
import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();

/**
 * @route POST /api/accounts
 * @desc Tạo tài khoản mới
 * @access Công khai
 */
router.post("/", accountController.createAccount);

/**
 * @route PUT /api/accounts/:id
 * @desc Cập nhật tài khoản theo ID
 * @access Quản trị viên/Thành viên/Tư vấn viên (tùy cấu hình)
 */
router.put("/:id", accountController.updateAccount);

/**
 * @route PUT /api/accounts/profile
 * @desc Cập nhật hồ sơ người dùng hiện tại (Thành viên/Tư vấn viên)
 * @access Thành viên/Tư vấn viên (tùy cấu hình)
 */
router.put("/profile", accountController.updateAccountProfile);

export default router;
