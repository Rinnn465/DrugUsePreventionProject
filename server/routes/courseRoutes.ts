/**
 * Các route API liên quan đến khóa học và bài học.
 * Cung cấp các endpoint để lấy thông tin khóa học, bài học, nội dung bài học, câu hỏi và đáp án.
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
 * @desc Lấy tất cả các khóa học hiện có
 * @access Công khai
 */
router.get("/", courseController.getCourses);

/**
 * @route GET /api/courses/:id
 * @desc Lấy chi tiết khóa học theo ID
 * @access Công khai
 */
router.get("/:id", courseController.getCourseById);

/**
 * @route GET /api/courses/:id/lessons
 * @desc Lấy tất cả bài học của một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons", lessonController.getLesson);

/**
 * @route GET /api/courses/:id/lessons/:lessonId
 * @desc Lấy nội dung bài học theo ID bài học
 * @access Công khai
 */
router.get("/:id/lessons/:lessonId", lessonController.getLessonContent);

/**
 * @route GET /api/courses/:id/lessons/questions
 * @desc Lấy tất cả câu hỏi của các bài học trong một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons/questions", lessonController.getQuestions);

/**
 * @route GET /api/courses/:id/lessons/questions/answers
 * @desc Lấy tất cả đáp án cho các câu hỏi bài học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons/questions/answers", lessonController.getAnswers);

export default router;