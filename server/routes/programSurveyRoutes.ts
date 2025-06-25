import express, { Router } from "express";
import * as ProgramSurveyController from "../controllers/programSurveyController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Get all communityProgramSurveys
router.get("/", ProgramSurveyController.getAllProgramSurveys);

// Get surveys by program ID 
router.get("/:programId", 
    authorizeRoles(["Guest", "Member", "Consultant", "Admin"]), 
    ProgramSurveyController.getSurveysByProgramId
);

// Create new communityProgramSurvey
router.post("/", ProgramSurveyController.createProgramSurvey);

// Delete communityProgramSurvey
router.delete("/:id", ProgramSurveyController.deleteProgramSurvey);

export default router;