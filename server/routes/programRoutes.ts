/**
 * Các route API liên quan đến chương trình cộng đồng.
 * Cung cấp các endpoint để xem, tạo, cập nhật, xóa chương trình cộng đồng và danh mục chương trình.
 * Bao gồm phân quyền theo vai trò cho quản trị viên.
 *
 * @module routes/programRoutes
 */
import express, { Router } from "express";
import * as programController from "../controllers/programController";
import * as programAttendeeController from "../controllers/programAttendeeController";
import authorizeRoles from "../middleware/authenMiddleware";

const router: Router = express.Router();

// Các route công khai - Khách có thể xem chương trình
/**
 * @route GET /api/programs/upcoming
 * @desc Lấy tất cả chương trình sắp diễn ra
 * @access Công khai/Khách
 */
router.get("/upcoming", programController.getUpcomingPrograms);

/**
 * @route GET /api/programs/past
 * @desc Lấy tất cả chương trình đã diễn ra
 * @access Công khai/Khách
 */
router.get("/past", programController.getPastPrograms);

/**
 * @route GET /api/programs/category/:categoryId
 * @desc Lấy tất cả chương trình theo danh mục cụ thể
 * @access Công khai/Khách
 */
router.get("/category/:categoryId", programController.getProgramsByCategory);

/**
 * @route GET /api/programs/:programId/attendees
 * @desc Lấy tất cả người tham gia của một chương trình cụ thể
 * @access Quản trị viên
 */
router.get("/:programId/attendees", 
    authorizeRoles(["Admin"]), 
    programAttendeeController.getTotalAttendeesByProgramId
);


/**
 * @route GET /api/programs
 * @desc Lấy tất cả chương trình cộng đồng
 * @access Công khai/Khách
 */
router.get("/", programController.getAllPrograms);

/**
 * @route GET /api/programs/:programId
 * @desc Lấy chương trình cộng đồng theo ID
 * @access Công khai/Khách
 */
router.get("/:programId", programController.getProgramById);

// Route quản trị viên - Quản lý chương trình
/**
 * @route POST /api/programs
 * @desc Tạo mới chương trình cộng đồng
 * @access Quản trị viên
 */
router.post("/", authorizeRoles(["Admin"]), programController.createProgram);

/**
 * @route PUT /api/programs/:programId
 * @desc Cập nhật chương trình cộng đồng theo ID
 * @access Quản trị viên
 */
router.put("/:programId", authorizeRoles(["Admin"]), programController.updateProgram);

/**
 * @route DELETE /api/programs/:programId
 * @desc Xóa chương trình cộng đồng theo ID
 * @access Quản trị viên
 */
router.delete("/:programId", authorizeRoles(["Admin"]), programController.deleteProgram);

/**
 * @route PATCH /api/programs/:programId/deactivate
 * @desc Vô hiệu hóa (xóa mềm) chương trình cộng đồng theo ID
 * @access Quản trị viên
 */
router.patch("/:programId/deactivate", authorizeRoles(["Admin"]), programController.deactivateProgram);

/**
 * @route PATCH /api/programs/:programId/activate
 * @desc Kích hoạt lại chương trình cộng đồng đã bị vô hiệu hóa theo ID
 * @access Quản trị viên
 */
router.patch("/:programId/activate", authorizeRoles(["Admin"]), programController.activateProgram);

// Route danh mục chương trình
/**
 * @route GET /api/program-categories
 * @desc Lấy tất cả danh mục chương trình
 * @access Công khai/Khách
 */
router.get("/categories", programController.getProgramCategories);

/**
 * @route GET /api/program-categories/:categoryId
 * @desc Lấy danh mục chương trình theo ID
 * @access Công khai/Khách
 */
router.get("/categories/:categoryId", programController.getProgramCategoryById);

/**
 * @route POST /api/program-categories
 * @desc Tạo mới danh mục chương trình
 * @access Quản trị viên
 */
router.post("/categories", authorizeRoles(["Admin"]), programController.createProgramCategory);

/**
 * @route PUT /api/program-categories/:categoryId
 * @desc Cập nhật danh mục chương trình theo ID
 * @access Quản trị viên
 */
router.put("/categories/:categoryId", authorizeRoles(["Admin"]), programController.updateProgramCategory);

/**
 * @route DELETE /api/program-categories/:categoryId
 * @desc Xóa danh mục chương trình theo ID
 * @access Quản trị viên
 */
router.delete("/categories/:categoryId", authorizeRoles(["Admin"]), programController.deleteProgramCategory);


export default router;