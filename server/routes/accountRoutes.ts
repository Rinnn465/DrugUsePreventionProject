import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Create new account (Public)
router.post("/", accountController.createAccount);

// Update account (Admin only)
router.put("/:id", authorizeRoles(["Admin"]), accountController.updateAccount);

// Update account profile (Member, Consultant, Admin)
router.put("/profile/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updateAccountProfile);

// Update account password (Member, Consultant, Admin)
router.put("/password/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updatePassword);

// Get all accounts (Admin only)
router.get("/", authorizeRoles(["Admin"]), accountController.getAccounts);

// Get account by ID (Member, Consultant, Admin - restricted to own account)
router.get("/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.getAccountById);

// Delete account (Admin only)
router.delete("/:id", authorizeRoles(["Admin"]), accountController.deleteAccount);

// Thống kê tổng số tài khoản (Admin only)
router.get("/statistics/count", authorizeRoles(["Admin"]), accountController.getMonthlyAccountCountStatistic);

// So sánh số lượng tài khoản được tạo giữa tháng hiện tại và tháng trước (Admin only)
router.get("/statistics/compare-count", authorizeRoles(["Admin"]), accountController.compareAccountCountStatistic);

export default router;