/**
 * Course and lesson-related API routes.
 * Provides endpoints for retrieving courses, lessons, lesson content, questions, and answers.
 *
 * @module routes/courseRoutes
 */
import express, { Router } from "express";
import * as courseController from "../controllers/courseController";
import * as lessonController from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/courses
 * @desc Get all available courses
 * @access Public
 */
router.get("/", courseController.getCourses);

/**
 * @route GET /api/courses/:id
 * @desc Get course details by ID
 * @access Public
 */
router.get("/:id", courseController.getCourseById);

/**
 * @route GET /api/courses/:id/lessons
 * @desc Get all lessons for a course by course ID
 * @access Public
 */
router.get("/:id/lessons", lessonController.getLesson);

/**
 * @route GET /api/courses/:id/lessons/:lessonId
 * @desc Get lesson content by lesson ID
 * @access Public
 */
router.get("/:id/lessons/:lessonId", lessonController.getLessonContent);

/**
 * @route GET /api/courses/:id/lessons/questions
 * @desc Get all questions for lessons in a course by course ID
 * @access Public
 */
router.get("/:id/lessons/questions", lessonController.getQuestions);

/**
 * @route GET /api/courses/:id/lessons/questions/answers
 * @desc Get all answers for lesson questions by course ID
 * @access Public
 */
router.get("/:id/lessons/questions/answers", lessonController.getAnswers);

export default router;