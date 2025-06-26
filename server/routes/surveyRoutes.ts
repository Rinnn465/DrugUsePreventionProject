/**
 * Các route API liên quan đến khảo sát.
 * Cung cấp các endpoint để xem, tạo, cập nhật, xóa khảo sát, bao gồm cả truy vấn theo danh mục.
 *
 * @module routes/surveyRoutes
 */
import express, { Router } from "express";
import * as surveyController from "../controllers/surveyController";

const router: Router = express.Router();

/**
 * @route GET /api/surveys
 * @desc Lấy tất cả khảo sát
 * @access Công khai
 */
router.get("/", surveyController.getAllSurveys);

/**
 * @route GET /api/surveys/:id
 * @desc Lấy khảo sát theo ID
 * @access Công khai
 */
router.get("/:id", surveyController.getSurveyById);

/**
 * @route GET /api/surveys/category/:categoryId
 * @desc Lấy tất cả khảo sát theo danh mục cụ thể
 * @access Công khai
 */
router.get("/category/:categoryId", surveyController.getSurveyByCategoryId);

/**
 * @route POST /api/surveys
 * @desc Tạo khảo sát mới
 * @access Công khai
 */
router.post("/", surveyController.createSurvey);

/**
 * @route PUT /api/surveys/:id
 * @desc Cập nhật khảo sát theo ID
 * @access Công khai
 */
router.put("/:id", surveyController.updateSurvey);

/**
 * @route DELETE /api/surveys/:id
 * @desc Xóa khảo sát theo ID
 * @access Công khai
 */
router.delete("/:id", surveyController.deleteSurvey);

export default router;
