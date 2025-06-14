import express, { Router } from "express";
import * as ProgramSurveyController from "../controllers/programSurveyController";

const router: Router = express.Router();

// Get all communityProgramSurveys
router.get("/",ProgramSurveyController.getAllProgramSurveys);

// Create new communityProgramSurvey
router.post("/", ProgramSurveyController.createProgramSurvey);

// Delete communityProgramSurvey
router.delete("/:id", ProgramSurveyController.deleteProgramSurvey);

export default router;