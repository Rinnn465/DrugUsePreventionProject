/**
 * Các route API quản lý tài khoản cho quản trị viên.
 * Cung cấp các endpoint để quản trị viên quản lý tài khoản người dùng.
 *
 * @module routes/adminRoutes
 */
import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();

/**
 * @route GET /api/admin/accounts
 * @desc Lấy tất cả tài khoản người dùng
 * @access Quản trị viên
 */
router.get("/", accountController.getAccounts);

/**
 * @route GET /api/admin/accounts/:id
 * @desc Lấy tài khoản người dùng theo ID
 * @access Quản trị viên
 */
router.get("/:id", accountController.getAccountById);

/**
 * @route DELETE /api/admin/accounts/:id
 * @desc Xóa tài khoản người dùng theo ID
 * @access Quản trị viên
 */
router.delete("/:id", accountController.deleteAccount);

export default router;
