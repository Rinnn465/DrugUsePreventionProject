import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import authenMiddleware from "../middleware/authenMiddleware";
import { restrictToAdminMiddleware } from "../middleware/restrictToAdminMiddleware";

const router: Router = express.Router();

// Get all accounts
router.get("/", accountController.getAccounts);

// Get account by ID
router.get("/:id", accountController.getAccountById);

// Create new account
router.post("/", accountController.createAccount);

// Update account
router.put("/:id", accountController.updateAccount);

// Delete account
router.delete("/:id", accountController.deleteAccount);

// Change account role
router.patch("/:id/role", authenMiddleware, restrictToAdminMiddleware, accountController.changeAccountRole);

export default router;
