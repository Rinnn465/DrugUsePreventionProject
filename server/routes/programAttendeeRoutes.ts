/**
 * Program attendee-related API routes.
 * Provides endpoints for enrollment, unenrollment, status checks, and admin management of program attendees.
 * Includes role-based authorization for each route.
 *
 * @module routes/programAttendeeRoutes
 */
import express, { Router } from "express";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

/**
 * @route GET /api/program-attendees/total/:programId
 * @desc Get total number of attendees for a program
 * @access Guest, Member, Consultant, Admin
 */
router.get("/total/:programId", 
    authorizeRoles(["Guest", "Member", "Consultant", "Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);

/**
 * @route GET /api/program-attendees/:programId/enrollment-status
 * @desc Check enrollment status for current user in a program
 * @access Member, Consultant, Admin
 */
router.get("/:programId/enrollment-status", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.checkEnrollmentStatus
);

/**
 * @route POST /api/program-attendees/:programId/enroll
 * @desc Enroll current user in a program
 * @access Member, Consultant, Admin
 */
router.post("/:programId/enroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.enrollInProgram
);

/**
 * @route DELETE /api/program-attendees/:programId/unenroll
 * @desc Unenroll current user from a program
 * @access Member, Consultant, Admin
 */
router.delete("/:programId/unenroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.unenrollFromProgram
);

/**
 * @route GET /api/program-attendees/my-enrollments
 * @desc Get all programs the current user is enrolled in
 * @access Member, Consultant, Admin
 */
router.get("/my-enrollments", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.getMyEnrolledPrograms
);

/**
 * @route GET /api/program-attendees
 * @desc Get all program attendees (admin only)
 * @access Admin
 */
router.get("/", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAllProgramAttendees
);

/**
 * @route GET /api/program-attendees/:programId/:accountId
 * @desc Get a specific attendee by program ID and account ID (admin only)
 * @access Admin
 */
router.get("/:programId/:accountId", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAttendeeById
);

export default router;