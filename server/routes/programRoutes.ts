/**
 * Community program-related API routes.
 * Provides endpoints for viewing, creating, updating, and deleting community programs.
 * Includes role-based authorization for admin management.
 *
 * @module routes/programRoutes
 */
import express, { Router } from "express";
import * as programController from "../controllers/programController";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Public routes - Guests can view programs
/**
 * @route GET /api/programs
 * @desc Get all community programs
 * @access Public/Guest
 */
router.get("/", programController.getAllPrograms);

/**
 * @route GET /api/programs/:id
 * @desc Get a community program by ID
 * @access Public/Guest
 */
router.get(":/id", programController.getProgramById);

// Admin routes - Program management
/**
 * @route POST /api/programs
 * @desc Create a new community program
 * @access Admin
 */
router.post("/", authorizeRoles(["Admin"]), programController.createProgram);

/**
 * @route PUT /api/programs/:id
 * @desc Update a community program by ID
 * @access Admin
 */
router.put(":/id", authorizeRoles(["Admin"]), programController.updateProgram);

/**
 * @route DELETE /api/programs/:id
 * @desc Delete a community program by ID
 * @access Admin
 */
router.delete(":/id", authorizeRoles(["Admin"]), programController.deleteProgram);

// Admin routes - Course management (to be implemented)
/**
 * @route GET /api/programs/:programId/attendees
 * @desc Get all attendees for a specific program
 * @access Admin
 */
router.get("/:programId/attendees", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);

export default router;