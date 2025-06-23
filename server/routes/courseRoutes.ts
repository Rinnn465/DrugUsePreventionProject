import express, { Router } from "express";
import * as courseController from "../controllers/courseController";
import * as lessonController from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

// fetch all availalbe courses
router.get("/", courseController.getCourses);

// fetch all course categories
router.get("/category", courseController.getCourseCategories);

// fetch course by id
router.get("/:id", courseController.getCourseById);

// enroll in a course
router.post("/:id/enroll", courseController.enrollCourse);

//get all enrolled courses by user id
router.get("/:id/enrolled/user", courseController.getEnrolledCourses);


// unenroll from a course
// router.post("/:id/unenroll", courseController.unenrollCourse);

//complete course
router.patch("/:id/complete", courseController.completeCourse);

//fetch all enrolled courses
router.get("/enrolled", courseController.getEnrolledCourses);

//fetch all completed courses
router.get("/:courseId/completed/:accountId", courseController.getCompletedCourseById);

// fetch lesson by course id
router.get("/:id/lessons", lessonController.getLesson);

//  fetch lesson content by lesson id
router.get("/:id/lessons/:lessonId", lessonController.getLessonContent);

// fetch lesson questions by lesson id
router.get("/:id/lessons/questions", lessonController.getQuestions);

// fetch lesson answers by lesson id and question id
router.get("/:id/lessons/questions/answers", lessonController.getAnswers);


export default router;