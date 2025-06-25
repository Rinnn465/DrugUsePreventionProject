/**
 * Survey-related API routes.
 * Provides endpoints for viewing, creating, updating, and deleting surveys, including category-based queries.
 *
 * @module routes/surveyRoutes
 */
import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";

const router: Router = express.Router();

/**
 * @route GET /api/surveys
 * @desc Get all surveys
 * @access Public
 */
router.get("/", surveyController.getAllSurveys);

/**
 * @route GET /api/surveys/:id
 * @desc Get a survey by ID
 * @access Public
 */
router.get("/:id", surveyController.getSurveyById);

/**
 * @route GET /api/surveys/category/:categoryId
 * @desc Get all surveys for a specific category
 * @access Public
 */
router.get("/category/:categoryId", surveyController.getSurveyByCategoryId);

/**
 * @route POST /api/surveys
 * @desc Create a new survey
 * @access Public
 */
router.post("/", surveyController.createSurvey);

/**
 * @route PUT /api/surveys/:id
 * @desc Update a survey by ID
 * @access Public
 */
router.put("/:id", surveyController.updateSurvey);

/**
 * @route DELETE /api/surveys/:id
 * @desc Delete a survey by ID
 * @access Public
 */
router.delete("/:id", surveyController.deleteSurvey);

export default router;
