import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();

// Create new account
router.post("/", accountController.createAccount);

// Update account
router.put("/:id", accountController.updateAccount);

// Update account profile (for Member/Consultant)
router.put("/profile", accountController.updateAccountProfile);

export default router;
