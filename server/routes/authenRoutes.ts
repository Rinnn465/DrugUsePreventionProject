import express, { Router } from "express";
import { 
    login, 
    register, 
    logout, 
    forgotPassword, 
    postVerifyResetToken, 
    resetPassword,
} from "../controllers/authenController";


// Create router
const router: Router = express.Router();

// Login route
router.post("/login", login);

// Register route
router.post("/register", register);

// Logout route
router.post("/logout", logout);

// forgot password route
router.post("/forgot-password", forgotPassword);

// verify token route
router.post("/verify-token", postVerifyResetToken);

router.post("/reset-token", resetPassword);


export default router;