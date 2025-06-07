import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";

const router: Router = express.Router();

// Get all surveys
router.get("/", surveyController.getAllSurveys);

// Get survey by ID
router.get("/:id", surveyController.getSurveyById);


export default router;