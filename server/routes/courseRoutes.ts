import express, { Router } from "express";
import * as courseController from "../controllers/courseController";
import * as lessonController from "../controllers/lessonController";
import authorizeRoles from "../middleware/authenMiddleware";

// Tạo router
const router: Router = express.Router();

/**
 * @route GET /api/course
 * @desc Lấy tất cả các khóa học
 * @access Công khai
 */
router.get("/", courseController.getCourses);

/**
 * @route GET /api/course/category
 * @desc Lấy tất cả danh mục khóa học
 * @access Công khai
 */
router.get("/category", courseController.getCourseCategories);

/**
 * @route GET /api/course/:id
 * @desc Lấy chi tiết khóa học theo ID
 * @access Công khai
 */
router.get("/:id", courseController.getCourseById);

/**
 * @route POST /api/course
 * @desc Tạo mới một khóa học
 * @access Chỉ Admin, Staff, Manager
 */
router.post("/", authorizeRoles(["Admin", "Staff", "Manager"]), courseController.createCourse);

/**
 * @route PUT /api/course/:id
 * @desc Cập nhật thông tin khóa học theo ID
 * @access Chỉ Admin, Staff, Manager
 */
router.put("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), courseController.updateCourse);

/**
 * @route DELETE /api/course/:id
 * @desc Xoá khóa học theo ID
 * @access Chỉ Admin, Staff, Manager
 */
router.delete("/:id", authorizeRoles(["Admin", "Staff", "Manager"]), courseController.deleteCourse);

/**
 * @route POST /api/course/:id/enroll
 * @desc Đăng ký khóa học
 * @access Thành viên
 */
router.post("/:id/enroll", courseController.enrollCourse);

/**
 * @route GET /api/course/:id/enrolled/user
 * @desc Lấy tất cả các khóa học đã đăng ký của user
 * @access Thành viên
 */
router.get("/:id/enrolled/user", courseController.getEnrolledCourses);

/**
 * @route DELETE /api/course/:id/unenroll
 * @desc Hủy đăng ký khóa học
 * @access Thành viên
 */
router.delete("/:id/unenroll", courseController.unenrollCourse);

/**
 * @route PATCH /api/course/:id/complete
 * @desc Đánh dấu hoàn thành khóa học
 * @access Thành viên
 */
router.patch("/:id/complete", courseController.completeCourse);

/**
 * @route GET /api/course/enrolled
 * @desc Lấy tất cả các khóa học đã đăng ký (route tổng hợp)
 * @access Thành viên
 */
router.get("/enrolled", courseController.getEnrolledCourses);

/**
 * @route GET /api/course/:courseId/completed/:accountId
 * @desc Lấy thông tin hoàn thành khóa học
 * @access Thành viên
 */
router.get("/:courseId/completed/:accountId", courseController.getCompletedCourseById);

/**
 * @route GET /api/course/:id/lessons
 * @desc Lấy tất cả bài học của một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons", lessonController.getLesson);

/**
 * @route GET /api/course/:id/lessons/:lessonId
 * @desc Lấy nội dung bài học theo ID bài học
 * @access Công khai
 */
router.get("/:id/lessons/:lessonId", lessonController.getLessonContent);

/**
 * @route GET /api/course/:id/lessons/questions
 * @desc Lấy tất cả câu hỏi của các bài học trong một khóa học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons/questions", lessonController.getQuestions);

/**
 * @route GET /api/course/:id/lessons/questions/answers
 * @desc Lấy tất cả đáp án cho các câu hỏi bài học theo ID khóa học
 * @access Công khai
 */
router.get("/:id/lessons/questions/answers", lessonController.getAnswers);

export default router;