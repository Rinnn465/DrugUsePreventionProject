/**
 * Các route API liên quan đến khảo sát chương trình.
 * Cung cấp các endpoint để xem, tạo, cập nhật, xóa khảo sát chương trình, bao gồm cả truy vấn theo danh mục.
 *
 * @module routes/programSurveyRoutes
 */
import express, { Router } from "express";
import * as ProgramSurveyController from "../controllers/programSurveyController";

const router: Router = express.Router();

/**
 * @route GET /api/program-surveys
 * @desc Lấy tất cả khảo sát chương trình
 * @access Công khai
 */
router.get("/", ProgramSurveyController.getAllProgramSurveys);

/**
 * @route GET /api/program-surveys/:id
 * @desc Lấy khảo sát chương trình theo ID
 * @access Công khai
 */
router.get("/:id", ProgramSurveyController.getProgramSurveyById);

/**
 * @route POST /api/program-surveys
 * @desc Tạo khảo sát chương trình mới
 * @access Công khai
 */
router.post("/", ProgramSurveyController.createProgramSurvey);

/**
 * @route PUT /api/program-surveys/:id
 * @desc Cập nhật khảo sát chương trình theo ID
 * @access Công khai
 */
router.put("/:id", ProgramSurveyController.updateProgramSurvey);

/**
 * @route DELETE /api/program-surveys/:id
 * @desc Xóa khảo sát chương trình theo ID
 * @access Công khai
 */
router.delete("/:id", ProgramSurveyController.deleteProgramSurvey);

/**
 * @route GET /api/program-surveys/category/:categoryId
 * @desc Lấy tất cả khảo sát chương trình theo danh mục cụ thể
 * @access Công khai
 */
router.get("/category/:categoryId", ProgramSurveyController.getProgramSurveyByCategoryId);

export default router;