import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Submit survey response
router.post("/submit", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    surveyController.submitSurveyResponse
);

// Get survey responses by user and program (Admin only)
router.get("/responses/:programId/:accountId", 
    authorizeRoles(["Admin", "Staff"]), 
    surveyController.getSurveyResponsesByUser
);

// Get all survey responses for a program (Admin only)
router.get("/responses/program/:programId", 
    authorizeRoles(["Admin", "Staff"]), 
    surveyController.getSurveyResponsesByProgram
);

// Get survey response statistics for a program (Admin only)
router.get("/responses/program/:programId/statistics", 
    authorizeRoles(["Admin"]), 
    surveyController.getSurveyResponseStatistics
);

// Get specific survey response by user and type (Admin only)
router.get("/responses/:programId/:accountId/:surveyType", 
    authorizeRoles(["Admin", "Staff", "Manager"]), 
    surveyController.getSurveyResponseByUserAndType
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