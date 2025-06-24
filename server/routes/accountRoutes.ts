/**
 * Account-related API routes.
 * Provides endpoints for creating, updating, and managing user accounts and profiles.
 *
 * @module routes/accountRoutes
 */
import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();

/**
 * @route POST /api/accounts
 * @desc Create a new account
 * @access Public
 */
router.post("/", accountController.createAccount);

/**
 * @route PUT /api/accounts/:id
 * @desc Update an account by ID
 * @access Admin/Member/Consultant (as configured)
 */
router.put("/:id", accountController.updateAccount);

/**
 * @route PUT /api/accounts/profile
 * @desc Update the profile of the current user (Member/Consultant)
 * @access Member/Consultant (as configured)
 */
router.put("/profile", accountController.updateAccountProfile);

export default router;
