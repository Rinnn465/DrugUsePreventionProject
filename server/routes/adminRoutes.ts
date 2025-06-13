import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import authenMiddleware from "../middleware/authenMiddleware";
import { restrictToAdmin, restrictToAdminMiddleware } from "../middleware/restrictToAdminMiddleware";

const router: Router = express.Router();


// Get all accounts
router.get("/", authenMiddleware, restrictToAdminMiddleware, accountController.getAccounts);

// Get account by ID
router.get("/:id",authenMiddleware, restrictToAdminMiddleware, accountController.getAccountById);

// Delete account
router.delete("/:id", authenMiddleware, restrictToAdminMiddleware, accountController.deleteAccount);

// Change account role
router.patch("/:id/role", authenMiddleware, restrictToAdminMiddleware, accountController.changeAccountRole);