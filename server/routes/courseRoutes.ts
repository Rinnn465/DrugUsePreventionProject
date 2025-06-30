/**
 * Các route API liên quan đến khóa học và bài học.
 * Cung cấp các endpoint để lấy thông tin khóa học, bài học, nội dung bài học, câu hỏi và đáp án.
 *
 * @module routes/courseRoutes
 */
import express, { Router } from "express";
import * as courseController from "../controllers/courseController";
import * as lessonController from "../controllers/lessonController";
import authorizeRoles from "../middleware/authenMiddleware";

// Create router
const router: Router = express.Router();

/**
<<<<<<< Updated upstream
 * @route GET /api/courses
 * @desc Lấy tất cả các khóa học hiện có
=======
 * @route GET /api/course
 * @desc Lấy tất cả khoá học
>>>>>>> Stashed changes
 * @access Công khai
 */
router.get("/", courseController.getCourses);

/**
<<<<<<< Updated upstream
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

=======
 * @route GET /api/course/category
 * @desc Lấy tất cả danh mục khoá học
 * @access Công khai
 */
router.get("/category", courseController.getCourseCategories);

/**
 * @route GET /api/course/:id
 * @desc Lấy thông tin khoá học theo ID
 * @access Công khai
 */
router.get(":/id", courseController.getCourseById);

/**
 * @route POST /api/course/:id/enroll
 * @desc Đăng ký khoá học cho user
 * @access Yêu cầu đăng nhập
 */
router.post(":/id/enroll", courseController.enrollCourse);

/**
 * @route GET /api/course/:id/enrolled/user
 * @desc Lấy tất cả khoá học mà user đã đăng ký
 * @access Yêu cầu đăng nhập
 */
router.get(":/id/enrolled/user", courseController.getEnrolledCourses);

/**
 * @route DELETE /api/course/:id/unenroll
 * @desc Huỷ đăng ký khoá học cho user
 * @access Yêu cầu đăng nhập
 */
router.delete(":/id/unenroll", courseController.unenrollCourse);

/**
 * @route PATCH /api/course/:id/complete
 * @desc Hoàn thành khoá học cho user
 * @access Yêu cầu đăng nhập
 */
router.patch(":/id/complete", courseController.completeCourse);

/**
 * @route GET /api/course/enrolled
 * @desc Lấy tất cả khoá học đã đăng ký (toàn bộ)
 * @access Yêu cầu đăng nhập
 */
router.get("/enrolled", courseController.getEnrolledCourses);

/**
 * @route GET /api/course/:courseId/completed/:accountId
 * @desc Lấy thông tin khoá học đã hoàn thành theo courseId và accountId
 * @access Yêu cầu đăng nhập
 */
router.get(":/courseId/completed/:accountId", courseController.getCompletedCourseById);

/**
 * @route GET /api/course/:id/lessons
 * @desc Lấy danh sách bài học theo courseId
 * @access Công khai
 */
router.get(":/id/lessons", lessonController.getLesson);

/**
 * @route GET /api/course/:id/lessons/:lessonId
 * @desc Lấy nội dung bài học theo lessonId
 * @access Công khai
 */
router.get(":/id/lessons/:lessonId", lessonController.getLessonContent);

/**
 * @route GET /api/course/:id/lessons/questions
 * @desc Lấy danh sách câu hỏi theo lessonId
 * @access Công khai
 */
router.get(":/id/lessons/questions", lessonController.getQuestions);

/**
 * @route GET /api/course/:id/lessons/questions/answers
 * @desc Lấy danh sách đáp án theo lessonId và questionId
 * @access Công khai
 */
router.get(":/id/lessons/questions/answers", lessonController.getAnswers);

/**
 * @route POST /api/course
 * @desc Tạo mới khoá học
 * @access Admin, Staff
 */
router.post("/", authorizeRoles(["Admin", "Staff"]), courseController.createCourse);

/**
 * @route PUT /api/course/:id
 * @desc Cập nhật khoá học
 * @access Admin, Staff
 */
router.put(":/id", authorizeRoles(["Admin", "Staff"]), courseController.updateCourse);

/**
 * @route DELETE /api/course/:id
 * @desc Xoá khoá học
 * @access Admin, Staff
 */
router.delete(":/id", authorizeRoles(["Admin", "Staff"]), courseController.deleteCourse);

>>>>>>> Stashed changes
export default router;