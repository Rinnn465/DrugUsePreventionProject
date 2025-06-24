/**
 * Admin account management API routes.
 * Provides endpoints for administrators to manage user accounts.
 *
 * @module routes/adminRoutes
 */
import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();

/**
 * @route GET /api/admin/accounts
 * @desc Get all user accounts
 * @access Admin
 */
router.get("/", accountController.getAccounts);

/**
 * @route GET /api/admin/accounts/:id
 * @desc Get a user account by ID
 * @access Admin
 */
router.get("/:id", accountController.getAccountById);

/**
 * @route DELETE /api/admin/accounts/:id
 * @desc Delete a user account by ID
 * @access Admin
 */
router.delete("/:id", accountController.deleteAccount);

export default router;
