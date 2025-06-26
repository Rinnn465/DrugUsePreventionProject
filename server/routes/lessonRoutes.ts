/**
 * Các route API liên quan đến bài học.
 * Cung cấp các endpoint để lấy, tạo, cập nhật và quản lý bài học, câu hỏi, đáp án.
 *
 * @module routes/lessonRoute
 */
import express, { Router } from "express";
import * as lessonController from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/lessons/:id
 * @desc Lấy tất cả bài học của một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id", lessonController.getLesson);

/**
 * @route GET /api/lessons/content/:id
 * @desc Lấy nội dung bài học và câu hỏi cho một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/content/:id", lessonController.getLessonContent);

/**
 * @route GET /api/lessons/questions/:id
 * @desc Lấy tất cả câu hỏi của một bài học theo ID bài học
 * @access Công khai
 */
router.get("/questions/:id", lessonController.getQuestions);

/**
 * @route GET /api/lessons/answers/:id
 * @desc Lấy tất cả đáp án cho các câu hỏi trong một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/answers/:id", lessonController.getAnswers);

/**
 * @route GET /api/lessons/course/:id/details
 * @desc Lấy tất cả bài học, câu hỏi và đáp án cho một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/course/:id/details", lessonController.getLessonDetails);

/**
 * @route GET /api/lessons/lesson/:id
 * @desc Lấy một bài học cụ thể theo ID bài học
 * @access Công khai
 */
router.get("/lesson/:id", lessonController.getLessonById);

/**
 * @route POST /api/lessons
 * @desc Tạo mới bài học
 * @access Quản trị viên
 */
router.post("/", lessonController.createLesson);

/**
 * @route PUT /api/lessons/:id
 * @desc Cập nhật bài học theo ID bài học
 * @access Quản trị viên
 */
router.put("/:id", lessonController.updateLesson);

/**
 * @route DELETE /api/lessons/:id
 * @desc Xóa bài học theo ID bài học
 * @access Quản trị viên
 */
router.delete("/:id", lessonController.deleteLesson);

/**
 * @route PUT /api/lessons/content/:id
 * @desc Cập nhật nội dung bài học theo ID bài học
 * @access Quản trị viên
 */
router.put("/content/:id", lessonController.updateLessonContent);

/**
 * @route POST /api/lessons/questions
 * @desc Tạo mới câu hỏi cho bài học
 * @access Quản trị viên
 */
router.post("/questions", lessonController.createLessonQuestion);

/**
 * @route PUT /api/lessons/questions/:id
 * @desc Cập nhật câu hỏi bài học theo ID câu hỏi
 * @access Quản trị viên
 */
router.put("/questions/:id", lessonController.updateLessonQuestion);

/**
 * @route DELETE /api/lessons/questions/:id
 * @desc Xóa câu hỏi bài học theo ID câu hỏi
 * @access Quản trị viên
 */
router.delete("/questions/:id", lessonController.deleteLessonQuestion);

/**
 * @route POST /api/lessons/answers
 * @desc Tạo mới đáp án cho bài học
 * @access Quản trị viên
 */
router.post("/answers", lessonController.createLessonAnswer);

/**
 * @route PUT /api/lessons/answers/:id
 * @desc Cập nhật đáp án bài học theo ID đáp án
 * @access Quản trị viên
 */
router.put("/answers/:id", lessonController.updateLessonAnswer);

/**
 * @route DELETE /api/lessons/answers/:id
 * @desc Xóa đáp án bài học theo ID đáp án
 * @access Quản trị viên
 */
router.delete("/answers/:id", lessonController.deleteLessonAnswer);

/**
 * @route PUT /api/lessons/deactivate/:id
 * @desc Vô hiệu hóa bài học theo ID bài học
 * @access Quản trị viên
 */
router.put("/deactivate/:id", lessonController.deactivateLesson);

/**
 * @route PUT /api/lessons/activate/:id
 * @desc Kích hoạt bài học theo ID bài học
 * @access Quản trị viên
 */
router.put("/activate/:id", lessonController.activateLesson);

export default router;