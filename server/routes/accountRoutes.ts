/**
 * Các route API liên quan đến tài khoản.
 * Cung cấp các endpoint để tạo, cập nhật và quản lý tài khoản, hồ sơ người dùng.
 *
 * @module routes/accountRoutes
 */
import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

/**
 * @route POST /api/account
 * @desc Tạo tài khoản mới
 * @access Công khai
 */
router.post("/", accountController.createAccount);

/**
 * @route PUT /api/account/:id
 * @desc Cập nhật tài khoản (Admin)
 * @access Admin
 */
router.put("/:id", authorizeRoles(["Admin"]), accountController.updateAccount);

/**
 * @route PUT /api/account/profile/:id
 * @desc Cập nhật hồ sơ tài khoản
 * @access Member, Consultant, Admin
 */
router.put("/profile/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updateAccountProfile);

/**
 * @route PUT /api/account/password/:id
 * @desc Đổi mật khẩu tài khoản
 * @access Member, Consultant, Admin
 */
router.put("/password/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updatePassword);

/**
 * @route GET /api/account/all
 * @desc Lấy tất cả tài khoản (Admin)
 * @access Admin
 */
router.get("/all", authorizeRoles(["Admin"]), accountController.getAccounts);

/**
 * @route GET /api/account/:id
 * @desc Lấy tài khoản theo ID (chỉ xem được tài khoản của mình)
 * @access Member, Consultant, Admin
 */
router.get("/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.getAccountById);

/**
 * @route DELETE /api/account/:id
 * @desc Xoá tài khoản (Admin)
 * @access Admin
 */
router.delete("/:id", authorizeRoles(["Admin"]), accountController.deleteAccount);

export default router;
