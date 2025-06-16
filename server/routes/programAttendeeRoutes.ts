import express, { Router } from "express";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Public route - Lấy tổng số người tham gia (tất cả có thể xem)
router.get("/total/:programId", 
    authorizeRoles(["Guest", "Member", "Consultant", "Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);

// User enrollment routes - Chỉ Member, Consultant, Admin
router.get("/:programId/enrollment-status", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.checkEnrollmentStatus
);

router.post("/:programId/enroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.enrollInProgram
);

router.delete("/:programId/unenroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.unenrollFromProgram
);

router.get("/my-enrollments", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.getMyEnrolledPrograms
);

// Admin routes - Quản lý người tham gia (chỉ Admin)
router.get("/", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAllProgramAttendees
);

router.get("/:programId/:accountId", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAttendeeById
);

export default router;