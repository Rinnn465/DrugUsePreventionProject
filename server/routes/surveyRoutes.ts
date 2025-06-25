import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Submit survey response
router.post("/submit", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    surveyController.submitSurveyResponse
);

// Get survey by category
router.get("/category/:categoryId", 
    surveyController.getSurveyByCategoryId
);

// Get all surveys
router.get("/", surveyController.getAllSurveys);

// Get survey by ID - ĐẶT SAU các routes cụ thể
router.get("/:id", surveyController.getSurveyById);

// Create new survey
router.post("/", surveyController.createSurvey);

// Update survey
router.put("/:id", surveyController.updateSurvey);

// Delete survey
router.delete("/:id", surveyController.deleteSurvey);

export default router;