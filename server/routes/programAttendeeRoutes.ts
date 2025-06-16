import express, { Router } from "express";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Admin routes - Get all attendees across all programs
router.get("/", authorizeRoles(["Admin"]), programAttendeeController.getAllProgramAttendees);

// Admin routes - Get specific attendee by programId and accountId
router.get("/:programId/:accountId", authorizeRoles(["Admin"]), programAttendeeController.getAttendeeById);

// Public route - Get total attendees count for a program
router.get("/total/:programId", programAttendeeController.getTotalAttendeesByProgramId);


export default router;