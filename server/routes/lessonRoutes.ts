/**
 * Lesson-related API routes.
 * Provides endpoints for retrieving, creating, updating, and managing lessons, questions, and answers.
 *
 * @module routes/lessonRoute
 */
import express, { Router } from "express";
import * as lessonController from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/lessons/:id
 * @desc Get all lessons for a course by course ID
 * @access Public
 */
router.get("/:id", lessonController.getLesson);

/**
 * @route GET /api/lessons/content/:id
 * @desc Get lesson content and questions for a course by course ID
 * @access Public
 */
router.get("/content/:id", lessonController.getLessonContent);

/**
 * @route GET /api/lessons/questions/:id
 * @desc Get all questions for a lesson by lesson ID
 * @access Public
 */
router.get("/questions/:id", lessonController.getQuestions);

/**
 * @route GET /api/lessons/answers/:id
 * @desc Get all answers for questions in a course by course ID
 * @access Public
 */
router.get("/answers/:id", lessonController.getAnswers);

/**
 * @route GET /api/lessons/course/:id/details
 * @desc Get all lessons, questions, and answers for a course by course ID
 * @access Public
 */
router.get("/course/:id/details", lessonController.getLessonDetails);

/**
 * @route GET /api/lessons/lesson/:id
 * @desc Get a specific lesson by lesson ID
 * @access Public
 */
router.get("/lesson/:id", lessonController.getLessonById);

/**
 * @route POST /api/lessons
 * @desc Create a new lesson
 * @access Admin
 */
router.post("/", lessonController.createLesson);

/**
 * @route PUT /api/lessons/:id
 * @desc Update a lesson by lesson ID
 * @access Admin
 */
router.put("/:id", lessonController.updateLesson);

/**
 * @route DELETE /api/lessons/:id
 * @desc Delete a lesson by lesson ID
 * @access Admin
 */
router.delete("/:id", lessonController.deleteLesson);

/**
 * @route PUT /api/lessons/content/:id
 * @desc Update lesson content by lesson ID
 * @access Admin
 */
router.put("/content/:id", lessonController.updateLessonContent);

/**
 * @route POST /api/lessons/questions
 * @desc Create a new lesson question
 * @access Admin
 */
router.post("/questions", lessonController.createLessonQuestion);

/**
 * @route PUT /api/lessons/questions/:id
 * @desc Update a lesson question by question ID
 * @access Admin
 */
router.put("/questions/:id", lessonController.updateLessonQuestion);

/**
 * @route DELETE /api/lessons/questions/:id
 * @desc Delete a lesson question by question ID
 * @access Admin
 */
router.delete("/questions/:id", lessonController.deleteLessonQuestion);

/**
 * @route POST /api/lessons/answers
 * @desc Create a new lesson answer
 * @access Admin
 */
router.post("/answers", lessonController.createLessonAnswer);

/**
 * @route PUT /api/lessons/answers/:id
 * @desc Update a lesson answer by answer ID
 * @access Admin
 */
router.put("/answers/:id", lessonController.updateLessonAnswer);

/**
 * @route DELETE /api/lessons/answers/:id
 * @desc Delete a lesson answer by answer ID
 * @access Admin
 */
router.delete("/answers/:id", lessonController.deleteLessonAnswer);

/**
 * @route PUT /api/lessons/deactivate/:id
 * @desc Deactivate a lesson by lesson ID
 * @access Admin
 */
router.put("/deactivate/:id", lessonController.deactivateLesson);

/**
 * @route PUT /api/lessons/activate/:id
 * @desc Activate a lesson by lesson ID
 * @access Admin
 */
router.put("/activate/:id", lessonController.activateLesson);

export default router;