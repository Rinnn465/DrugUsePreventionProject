import express, { Router } from "express";
import * as programController from "../controllers/programController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Public routes - Guest có thể xem
router.get("/", programController.getAllPrograms);
router.get("/:id", programController.getProgramById);

// Admin routes - Quản lý chương trình
router.post("/", authorizeRoles(["Admin", "Staff", "Manager"]), programController.createProgram);
router.put("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), programController.updateProgram);
router.delete("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), programController.deleteProgram);

// Admin utility routes
router.post("/backfill-surveys", authorizeRoles(["Admin", "Staff", "Manager"]), programController.backfillSurveyMappings);
router.post("/:id/regenerate-zoom", authorizeRoles(["Admin", "Staff", "Manager"]), programController.regenerateZoomLink);


export default router;