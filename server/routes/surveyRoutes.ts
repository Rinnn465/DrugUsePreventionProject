import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";

const router: Router = express.Router();

// Get all surveys
router.get("/", surveyController.getAllSurveys);

// Get survey by ID
router.get("/:id", surveyController.getSurveyById);

// Get survey by CateID
router.get("/cate/:id", surveyController.getSurveyByCategoryId);

// Create new survey
router.post("/", surveyController.createSurvey);

// Update survey
router.put("/:id", surveyController.updateSurvey);

// Delete survey
router.delete("/:id", surveyController.deleteSurvey);

export default router;
