import express, { Router } from "express";
import * as lessonRoutes from "../controllers/lessonController";

// Create router
const router: Router = express.Router();

// fetch lesosn by course id
router.get("/:id", lessonRoutes.getLesson);


export default router;