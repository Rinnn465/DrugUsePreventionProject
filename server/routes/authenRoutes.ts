import express, { Router } from "express";
import { login, register, logout } from "../controllers/authenController";

// Create router
const router: Router = express.Router();

// Login route
router.post("/login", login);

// Register route
router.post("/register", register);

// Logout route
router.post("/logout", logout);

export default router;
