import express, { Router } from "express";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

/**
 * @route GET /api/program-attendee/total/:programId
 * @desc Lấy tổng số người tham gia một chương trình
 * @access Công khai
 */
router.get("/total/:programId", 
    authorizeRoles(["Guest", "Member", "Consultant", "Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);

/**
 * @route GET /api/program-attendee/my-enrollments
 * @desc Lấy danh sách chương trình đã đăng ký của user
 * @access Member, Consultant, Admin
 */
router.get("/my-enrollments", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.getMyEnrolledPrograms
);

/**
 * @route GET /api/program-attendee/statistics/enroll
 * @desc Thống kê số người tham gia từng chương trình
 * @access Chỉ Admin
 */
router.get("/statistics/enroll", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getMonthlyProgramEnrollmentStatistics
);

/**
 * @route GET /api/program-attendee/statistics/compare-enroll
 * @desc So sánh số lượng đăng ký chương trình giữa tháng hiện tại và tháng trước
 * @access Chỉ Admin
 */
router.get("/statistics/compare-enroll", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.compareProgramEnrollmentStatistics
);

/**
 * @route GET /api/program-attendee/
 * @desc Lấy tất cả người tham gia các chương trình (admin)
 * @access Chỉ Admin
 */
router.get("/", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAllProgramAttendees
);

/**
 * @route GET /api/program-attendee/:programId/enrollment-status
 * @desc Kiểm tra trạng thái đăng ký chương trình của user
 * @access Member, Consultant, Admin
 */
router.get("/:programId/enrollment-status", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.checkEnrollmentStatus
);

/**
 * @route POST /api/program-attendee/:programId/enroll
 * @desc Đăng ký tham gia chương trình
 * @access Member, Consultant, Admin
 */
router.post("/:programId/enroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.enrollInProgram
);

/**
 * @route DELETE /api/program-attendee/:programId/unenroll
 * @desc Hủy đăng ký tham gia chương trình
 * @access Member, Consultant, Admin
 */
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

// Get attendees for a specific program (Admin only)
router.get("/program/:programId", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAttendeesByProgramId
);

/**
 * @route GET /api/program-attendee/:programId/:accountId
 * @desc Lấy thông tin người tham gia theo chương trình và accountId
 * @access Chỉ Admin
 */
router.get("/:programId/:accountId", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAttendeeById
);

export default router;