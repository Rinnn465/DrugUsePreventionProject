/**
 * Các route API liên quan đến người tham gia chương trình.
 * Cung cấp các endpoint cho đăng ký, hủy đăng ký, kiểm tra trạng thái và quản lý người tham gia chương trình (dành cho admin).
 * Bao gồm phân quyền theo vai trò cho từng route.
 *
 * @module routes/programAttendeeRoutes
 */
import express, { Router } from "express";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

/**
 * @route GET /api/program-attendee/total/:programId
 * @desc Lấy tổng số người tham gia chương trình
 * @access Guest, Member, Consultant, Admin
 */
/**
 * @route GET /api/program-attendees/total/:programId
 * @desc Lấy tổng số người tham gia của một chương trình
 * @access Khách, Thành viên, Tư vấn viên, Quản trị viên
 */
router.get("/total/:programId", 
    authorizeRoles(["Guest", "Member", "Consultant", "Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);

/**
 * @route GET /api/program-attendee/:programId/enrollment-status
 * @desc Kiểm tra trạng thái đăng ký chương trình
 * @access Member, Consultant, Admin
 */
/**
 * @route GET /api/program-attendees/:programId/enrollment-status
 * @desc Kiểm tra trạng thái đăng ký của người dùng hiện tại với một chương trình
 * @access Thành viên, Tư vấn viên, Quản trị viên
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
/**
 * @route POST /api/program-attendees/:programId/enroll
 * @desc Đăng ký chương trình cho người dùng hiện tại
 * @access Thành viên, Tư vấn viên, Quản trị viên
 */
router.post("/:programId/enroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.enrollInProgram
);

/**
 * @route DELETE /api/program-attendee/:programId/unenroll
 * @desc Huỷ đăng ký tham gia chương trình
 * @access Member, Consultant, Admin
 */
/**
 * @route DELETE /api/program-attendees/:programId/unenroll
 * @desc Hủy đăng ký chương trình cho người dùng hiện tại
 * @access Thành viên, Tư vấn viên, Quản trị viên
 */
router.delete("/:programId/unenroll", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.unenrollFromProgram
);

/**
 * @route GET /api/program-attendee/my-enrollments
 * @desc Lấy danh sách chương trình đã đăng ký của tôi
 * @access Member, Consultant, Admin
 */
/**
 * @route GET /api/program-attendees/my-enrollments
 * @desc Lấy tất cả chương trình mà người dùng hiện tại đã đăng ký
 * @access Thành viên, Tư vấn viên, Quản trị viên
 */
router.get("/my-enrollments", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    programAttendeeController.getMyEnrolledPrograms
);

/**
 * @route GET /api/program-attendee
 * @desc Lấy tất cả người tham gia chương trình (Admin)
 * @access Admin
 */
/**
 * @route GET /api/program-attendees
 * @desc Lấy tất cả người tham gia chương trình (chỉ admin)
 * @access Quản trị viên
 */
router.get("/", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAllProgramAttendees
);

/**
 * @route GET /api/program-attendee/:programId/:accountId
 * @desc Lấy thông tin người tham gia theo ID
 * @access Admin
 */
/**
 * @route GET /api/program-attendees/:programId/:accountId
 * @desc Lấy thông tin người tham gia cụ thể theo programId và accountId (chỉ admin)
 * @access Quản trị viên
 */
router.get("/:programId/:accountId", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getAttendeeById
);

export default router;