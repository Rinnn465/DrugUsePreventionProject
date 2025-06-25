/**
 * Community program-related API routes.
 * Provides endpoints for viewing, creating, updating, and deleting community programs and categories.
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
router.get("/:id", programController.getProgramById);

/**
 * @route GET /api/programs/upcoming
 * @desc Get all upcoming community programs
 * @access Public/Guest
 */
router.get("/upcoming", programController.getUpcomingPrograms);

/**
 * @route GET /api/programs/past
 * @desc Get all past community programs
 * @access Public/Guest
 */
router.get("/past", programController.getPastPrograms);

/**
 * @route GET /api/programs/category/:categoryId
 * @desc Get all programs for a specific category
 * @access Public/Guest
 */
router.get("/category/:categoryId", programController.getProgramsByCategory);

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
router.put("/:id", authorizeRoles(["Admin"]), programController.updateProgram);

/**
 * @route DELETE /api/programs/:id
 * @desc Delete a community program by ID
 * @access Admin
 */
router.delete("/:id", authorizeRoles(["Admin"]), programController.deleteProgram);

// Program category routes
/**
 * @route GET /api/program-categories
 * @desc Get all program categories
 * @access Public/Guest
 */
router.get("/categories", programController.getProgramCategories);

/**
 * @route GET /api/program-categories/:id
 * @desc Get a program category by ID
 * @access Public/Guest
 */
router.get("/categories/:id", programController.getProgramCategoryById);

/**
 * @route POST /api/program-categories
 * @desc Create a new program category
 * @access Admin
 */
router.post("/categories", authorizeRoles(["Admin"]), programController.createProgramCategory);

/**
 * @route PUT /api/program-categories/:id
 * @desc Update a program category by ID
 * @access Admin
 */
router.put("/categories/:id", authorizeRoles(["Admin"]), programController.updateProgramCategory);

/**
 * @route DELETE /api/program-categories/:id
 * @desc Delete a program category by ID
 * @access Admin
 */
router.delete("/categories/:id", authorizeRoles(["Admin"]), programController.deleteProgramCategory);

// Admin routes - Get all attendees for a specific program
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