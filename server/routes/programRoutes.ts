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

/**
 * @route GET /api/programs/:programId/attendees
 * @desc Get all attendees for a specific program
 * @access Admin
 */
router.get("/:programId/attendees", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);


/**
 * @route GET /api/programs
 * @desc Get all community programs
 * @access Public/Guest
 */
router.get("/", programController.getAllPrograms);

/**
 * @route GET /api/programs/:programId
 * @desc Get a community program by ID
 * @access Public/Guest
 */
router.get("/:programId", programController.getProgramById);

// Admin routes - Program management
/**
 * @route POST /api/programs
 * @desc Create a new community program
 * @access Admin
 */
router.post("/", authorizeRoles(["Admin"]), programController.createProgram);

/**
 * @route PUT /api/programs/:programId
 * @desc Update a community program by ID
 * @access Admin
 */
router.put("/:programId", authorizeRoles(["Admin"]), programController.updateProgram);

/**
 * @route DELETE /api/programs/:programId
 * @desc Delete a community program by ID
 * @access Admin
 */
router.delete("/:programId", authorizeRoles(["Admin"]), programController.deleteProgram);

/**
 * @route PATCH /api/programs/:programId/deactivate
 * @desc Deactivate (soft delete) a community program by ID
 * @access Admin
 */
router.patch("/:programId/deactivate", authorizeRoles(["Admin"]), programController.deactivateProgram);

/**
 * @route PATCH /api/programs/:programId/activate
 * @desc Activate a previously deactivated community program by ID
 * @access Admin
 */
router.patch("/:programId/activate", authorizeRoles(["Admin"]), programController.activateProgram);

// Program category routes
/**
 * @route GET /api/program-categories
 * @desc Get all program categories
 * @access Public/Guest
 */
router.get("/categories", programController.getProgramCategories);

/**
 * @route GET /api/program-categories/:categoryId
 * @desc Get a program category by ID
 * @access Public/Guest
 */
router.get("/categories/:categoryId", programController.getProgramCategoryById);

/**
 * @route POST /api/program-categories
 * @desc Create a new program category
 * @access Admin
 */
router.post("/categories", authorizeRoles(["Admin"]), programController.createProgramCategory);

/**
 * @route PUT /api/program-categories/:categoryId
 * @desc Update a program category by ID
 * @access Admin
 */
router.put("/categories/:categoryId", authorizeRoles(["Admin"]), programController.updateProgramCategory);

/**
 * @route DELETE /api/program-categories/:categoryId
 * @desc Delete a program category by ID
 * @access Admin
 */
router.delete("/categories/:categoryId", authorizeRoles(["Admin"]), programController.deleteProgramCategory);


export default router;