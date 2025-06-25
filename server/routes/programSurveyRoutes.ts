/**
 * Program survey-related API routes.
 * Provides endpoints for viewing, creating, updating, and deleting program surveys, including category-based queries.
 *
 * @module routes/programSurveyRoutes
 */
import express, { Router } from "express";
import * as ProgramSurveyController from "../controllers/programSurveyController";

const router: Router = express.Router();

/**
 * @route GET /api/program-surveys
 * @desc Get all program surveys
 * @access Public
 */
router.get("/", ProgramSurveyController.getAllProgramSurveys);

/**
 * @route GET /api/program-surveys/:id
 * @desc Get a program survey by ID
 * @access Public
 */
router.get("/:id", ProgramSurveyController.getProgramSurveyById);

/**
 * @route POST /api/program-surveys
 * @desc Create a new program survey
 * @access Public
 */
router.post("/", ProgramSurveyController.createProgramSurvey);

/**
 * @route PUT /api/program-surveys/:id
 * @desc Update a program survey by ID
 * @access Public
 */
router.put("/:id", ProgramSurveyController.updateProgramSurvey);

/**
 * @route DELETE /api/program-surveys/:id
 * @desc Delete a program survey by ID
 * @access Public
 */
router.delete("/:id", ProgramSurveyController.deleteProgramSurvey);

/**
 * @route GET /api/program-surveys/category/:categoryId
 * @desc Get all program surveys for a specific category
 * @access Public
 */
router.get("/category/:categoryId", ProgramSurveyController.getProgramSurveyByCategoryId);

export default router;