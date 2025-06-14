import express, { Router } from "express";
import * as programController from "../controllers/programController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Get all programs
router.get("/", programController.getAllPrograms);

// Get program by ID
router.get("/:id", programController.getProgramById);

// Create new communityProgramAttende
router.post("/", authorizeRoles(["Admin"]), programController.createProgram);

// Update communityProgramAttende
router.put("/:id", authorizeRoles(["Admin"]), programController.updateProgram);

// Delete communityProgramAttende
router.delete("/:id", authorizeRoles(["Admin"]), programController.deleteProgram);


export default router;