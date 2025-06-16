import express, { Router } from "express";
import * as programController from "../controllers/programController";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Public routes - Get programs
router.get("/", programController.getAllPrograms);
router.get("/:id", programController.getProgramById);

// Admin routes - Program management
router.post("/", authorizeRoles(["Admin"]), programController.createProgram);
router.put("/:id", authorizeRoles(["Admin"]), programController.updateProgram);
router.delete("/:id", authorizeRoles(["Admin"]), programController.deleteProgram);

// User enrollment routes (require authentication)
router.post("/:programId/enroll", authorizeRoles(["Member", "Admin"]), programAttendeeController.enrollInProgram);
router.delete("/:programId/unenroll", authorizeRoles(["Member", "Admin"]), programAttendeeController.unenrollFromProgram);
router.get("/:programId/enrollment-status", authorizeRoles(["Member", "Admin"]), programAttendeeController.checkEnrollmentStatus);

// User's enrolled programs
router.get("/user/enrolled", authorizeRoles(["Member", "Admin"]), programAttendeeController.getMyEnrolledPrograms);


export default router;