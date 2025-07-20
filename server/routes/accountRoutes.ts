import express, { Router } from "express";
import multer from "multer";
import * as accountController from "../controllers/accountController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create new account (Public)
router.post("/", accountController.createAccount);

// Update account (Admin only)
router.put("/:id", authorizeRoles(["Admin"]), accountController.updateAccount);

// Update account profile (Member, Consultant, Admin)
router.put("/profile/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updateAccountProfile);

// Update account password (Member, Consultant, Admin)
router.put("/password/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.updatePassword);

// Upload avatar (Member, Consultant, Admin)
router.post("/:id/upload-avatar", authorizeRoles(["Member", "Consultant", "Admin"]), upload.single('profilePicture'), accountController.uploadAvatar);

// Remove avatar (Member, Consultant, Admin)
router.delete("/:id/remove-avatar", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.removeAvatar);

// Get all accounts (Admin only)
router.get("/", authorizeRoles(["Admin"]), accountController.getAccounts);

// Get all roles (Admin only)
router.get("/roles", authorizeRoles(["Admin"]), accountController.getRoles);

// Get account by ID (Member, Consultant, Admin - restricted to own account)
router.get("/:id", authorizeRoles(["Member", "Consultant", "Admin"]), accountController.getAccountById);

// Delete account (Admin only)
router.delete("/:id", authorizeRoles(["Admin"]), accountController.deleteAccount);

// Thống kê tổng số tài khoản (Admin only)
router.get("/statistics/count", authorizeRoles(["Admin"]), accountController.getMonthlyAccountCountStatistic);

// So sánh số lượng tài khoản được tạo giữa tháng hiện tại và tháng trước (Admin only)
router.get("/statistics/compare-count", authorizeRoles(["Admin"]), accountController.compareAccountCountStatistic);

export default router;