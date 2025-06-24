/**
 * Lesson-related API routes.
 * Provides endpoints for retrieving lessons by course ID.
 *
 * @module routes/lessonRoute
 */
import express, { Router } from "express";
import * as lessonRoutes from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/lessons/:id
 * @desc Get all lessons for a course by course ID
 * @access Public
 */
router.get("/:id", lessonRoutes.getLesson);

export default router;