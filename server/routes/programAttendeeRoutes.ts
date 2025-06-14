import express, { Router } from "express";
import * as programAttendeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Get all community program attendees
router.get("/", authorizeRoles(["Admin"]), programAttendeController.getAllProgramAttendees);

// Get community program attendees by programId
router.get("/:id", authorizeRoles(["Admin"]), programAttendeController.getAttendeeById);

// Get toatal account communityProgramAttende by programId
router.get("/total/:id", programAttendeController.getTotalAttendeesByProgramId);