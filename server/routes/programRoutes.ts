import express, { Router } from "express";
import * as programController from "../controllers/programController";

const router: Router = express.Router();

// Get all programs
router.get("/", programController.getAllPrograms);

// Get program by ID
router.get("/:id", programController.getProgramById);


export default router;