import express, { Router } from "express";
import * as programController from "../controllers/programController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Public routes - Guest có thể xem
router.get("/", programController.getAllPrograms);
router.get("/:id", programController.getProgramById);

// Admin routes - Quản lý chương trình
router.post("/", authorizeRoles(["Admin", "Staff"]), programController.createProgram);
router.put("/:id", authorizeRoles(["Admin", "Staff"]), programController.updateProgram);
router.delete("/:id", authorizeRoles(["Admin", "Staff"]), programController.deleteProgram);


export default router;