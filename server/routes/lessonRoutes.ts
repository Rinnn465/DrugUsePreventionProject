import express, { Router } from "express";
import * as lessonController from "../controllers/lessonController";
import authorizeRoles from "../middleware/authenMiddleware";

// Create router
const router: Router = express.Router();

// fetch lesosn by course id
router.get("/:id", lessonController.getLesson);
/*
 * @route GET /api/lesson/:id
 * @desc Lấy tất cả bài học của một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id", lessonController.getLesson);

/**
 * @route GET /api/lesson/content/:id
 * @desc Lấy nội dung bài học và câu hỏi cho một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/content/:id", lessonController.getLessonContent);

/**
 * @route GET /api/lesson/questions/:id
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
 * @route POST /api/lesson
 * @desc Tạo mới bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.post("/", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.createLesson);

/**
 * @route PUT /api/lesson/:id
 * @desc Cập nhật bài học theo ID bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.put("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.updateLesson);

/**
 * @route DELETE /api/lesson/:id
 * @desc Xóa bài học theo ID bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.delete("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.deleteLesson);

/**
 * @route POST /api/lesson/questions
 * @desc Tạo mới câu hỏi cho bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.post("/question", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.createLessonQuestion);

/**
 * @route PUT /api/lesson/questions/:id
 * @desc Cập nhật câu hỏi bài học theo ID câu hỏi
 * @access Chỉ Admin, Staff, Manager
 */
router.put("/question/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.updateLessonQuestion);

/**
 * @route DELETE /api/lesson/questions/:id
 * @desc Xóa câu hỏi bài học theo ID câu hỏi
 * @access Chỉ Admin, Staff, Manager
 */
router.delete("/question/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.deleteLessonQuestion);

/**
 * @route POST /api/lesson/answers
 * @desc Tạo mới đáp án cho bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.post("/answer", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.createLessonAnswer);

/**
 * @route PUT /api/lesson/answers/:id
 * @desc Cập nhật đáp án bài học theo ID đáp án
 * @access Chỉ Admin, Staff, Manager
 */
router.put("/answer/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.updateLessonAnswer);

/**
 * @route DELETE /api/lesson/answers/:id
 * @desc Xóa đáp án bài học theo ID đáp án
 * @access Chỉ Admin, Staff, Manager
 */
router.delete("/answer/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.deleteLessonAnswer);

export default router;