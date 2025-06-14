import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import * as programController from "../controllers/programController";


const router: Router = express.Router();


// Admin-only routes for account management
router.get("/", accountController.getAccounts);
router.get("/:id", accountController.getAccountById);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

// Admin-only routes for program management
router.post("/", programController.createProgram);
router.put("/:id", programController.updateProgram);
router.delete("/:id", programController.deleteProgram);

// Admin-only routes for managing surveys

export default router;