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
 * @route POST /api/survey/submit
 * @desc Gửi phản hồi khảo sát
 * @access Thành viên, Tư vấn viên, Admin
 */
router.post("/submit", 
    authorizeRoles(["Member", "Consultant", "Admin"]), 
    surveyController.submitSurveyResponse
);

/**
 * @route GET /api/survey/category/:categoryId
 * @desc Lấy khảo sát theo danh mục
 * @access Công khai
 */
router.get("/category/:categoryId", 
    surveyController.getSurveyByCategoryId
);

/**
 * @route GET /api/survey
 * @desc Lấy tất cả khảo sát
 * @access Công khai
 */
/**
 * @route GET /api/surveys
 * @desc Lấy tất cả khảo sát
 * @access Công khai
 */
router.get("/", surveyController.getAllSurveys);

/**
 * @route GET /api/survey/:id
 * @desc Lấy khảo sát theo ID
 * @access Công khai
 */
/**
 * @route GET /api/surveys/:id
 * @desc Lấy khảo sát theo ID
 * @access Công khai
 */
router.get("/:id", surveyController.getSurveyById);

/**
 * @route POST /api/survey
 * @desc Tạo khảo sát mới
 * @access Công khai hoặc Admin
 */
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
 * @route PUT /api/survey/:id
 * @desc Cập nhật khảo sát
 * @access Công khai hoặc Admin
 */
/**
 * @route PUT /api/surveys/:id
 * @desc Cập nhật khảo sát theo ID
 * @access Công khai
 */
router.put("/:id", surveyController.updateSurvey);

/**
 * @route DELETE /api/survey/:id
 * @desc Xoá khảo sát
 * @access Công khai hoặc Admin
 */
/**
 * @route DELETE /api/surveys/:id
 * @desc Xóa khảo sát theo ID
 * @access Công khai
 */
router.delete("/:id", surveyController.deleteSurvey);

export default router;
