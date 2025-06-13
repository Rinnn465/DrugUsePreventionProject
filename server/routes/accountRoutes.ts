import express, { Router } from "express";
import * as accountController from "../controllers/accountController";
import authenMiddleware from "../middleware/authenMiddleware";


const router: Router = express.Router();

// Create new account
router.post("/", accountController.createAccount);

// Update account
router.put("/:id", accountController.updateAccount);



export default router;
