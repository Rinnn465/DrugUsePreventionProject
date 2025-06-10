import express, { Router } from "express";
import * as courseController from "../controllers/courseController";
import * as lessonController from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

// fetch all availalbe courses
router.get("/", courseController.getCourses);

// fetch course by id
router.get("/:id", courseController.getCourseById);

// fetch lesson by course id
router.get("/:id/lessons", lessonController.getLesson);

//  fetch lesson content by lesson id
router.get("/:id/lessons/:lessonId", lessonController.getLessonContent);

// fetch lesson questions by lesson id
router.get("/:id/lessons/questions", lessonController.getQuestions);

// fetch lesson answers by lesson id and question id
router.get("/:id/lessons/questions/answers", lessonController.getAnswers);


export default router;