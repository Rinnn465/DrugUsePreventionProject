import express, { Router } from "express";
import * as lessonController from "../controllers/lessonController";
import authorizeRoles from "../middleware/authenMiddleware";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/lessons/course/:id
 * @desc Lấy tất cả bài học của một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/course/:id", lessonController.getLesson);

/**
 * @route GET /api/lessons/:id
 * @desc Lấy chi tiết một bài học theo ID bài học
 * @access Công khai
 */
router.get("/:id", lessonController.getLessonById);

/**
 * @route POST /api/lessons
 * @desc Tạo mới bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.post("/", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.createLesson);

/**
 * @route PUT /api/lessons/:id
 * @desc Cập nhật bài học theo ID bài học
 * @access Chỉ Admin, Staff, Manager
 */
router.put("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.updateLesson);

/**
 * @route DELETE /api/lessons/:id
 * @desc Xóa bài học theo ID bài học (soft delete)
 * @access Chỉ Admin, Staff, Manager
 */
router.delete("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), lessonController.deleteLesson);

export default router;