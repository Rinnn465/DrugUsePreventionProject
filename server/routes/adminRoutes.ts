import express, { Router } from "express";
import * as accountController from "../controllers/accountController";

const router: Router = express.Router();


// Get all accounts
router.get("/", accountController.getAccounts);

// Get account by ID
router.get("/:id", accountController.getAccountById);

// Delete account
router.delete("/:id", accountController.deleteAccount);
