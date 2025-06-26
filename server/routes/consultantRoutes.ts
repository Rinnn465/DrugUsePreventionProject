/**
 * Các route API liên quan đến tư vấn viên.
 * Cung cấp các endpoint để lấy thông tin tư vấn viên, bằng cấp, chuyên môn và lịch làm việc.
 *
 * @module routes/consultantRoutes
 */
import express, { Router } from 'express';
import dotenv from 'dotenv';
import { getConsultants, getConsultantById, getQualifications, getSpecialties } from '../controllers/consultantController';
import * as consultantScheduleController from '../controllers/consultantScheduleController'; // Ensure this file exists
// Update the import path if the file is named differently or in another location
// Example: If the file is named consultant-schedule.controller.ts
// import { getConsultantSchedule } from '../controllers/consultant-schedule.controller';

// If the file does not exist, create it with the following content:

dotenv.config();

// Create router instance for consultant endpoints
const router: Router = express.Router();

/**
 * @route GET /api/consultants
 * @desc Lấy tất cả tư vấn viên
 * @access Công khai
 */
router.get('/', getConsultants);

/**
 * @route GET /api/consultants/qualifications
 * @desc Lấy tất cả bằng cấp của tư vấn viên
 * @access Công khai
 */
router.get('/qualifications', getQualifications)

/**
 * @route GET /api/consultants/specialties
 * @desc Lấy tất cả chuyên môn của tư vấn viên
 * @access Công khai
 */
router.get('/specialties', getSpecialties)

/**
 * @route GET /api/consultants/:id
 * @desc Lấy tư vấn viên theo ID
 * @access Công khai
 */
router.get('/:id', getConsultantById);

/**
 * @route GET /api/consultants/:id/schedule
 * @desc Lấy lịch làm việc của tư vấn viên theo ID tư vấn viên
 * @access Công khai
 */
router.get('/:id/schedule', consultantScheduleController.getScheduleByScheduleId);

/**
 * @route GET /api/consultants/schedule
 * @desc Lấy tất cả lịch làm việc của tư vấn viên
 * @access Công khai
 */
router.get('/schedule', consultantScheduleController.getSchedules);

/**
 * @route GET /api/consultants/schedule/:consultantId
 * @desc Lấy lịch làm việc cho một tư vấn viên cụ thể theo ID
 * @access Công khai
 */
 router.get('/schedule/:consultantId', consultantScheduleController.getSchedulesByConsultantId); // Uncomment if needed

/**
 * @route POST /api/consultants/schedule
 * @desc Tạo mới lịch làm việc cho tư vấn viên
 * @access Tư vấn viên
 */
router.post('/schedule', consultantScheduleController.createSchedule); // Uncomment if needed

/**
 * @route PUT /api/consultants/schedule/:id
 * @desc Cập nhật lịch làm việc của tư vấn viên theo ID
 * @access Tư vấn viên
 */
router.put('/schedule/:id', consultantScheduleController.updateSchedule); // Uncomment if needed

/**
 * @route DELETE /api/consultants/schedule/:id
 * @desc Xóa lịch làm việc của tư vấn viên theo ID
 * @access Tư vấn viên
 */
router.delete('/schedule/:id', consultantScheduleController.deleteSchedule); // Uncomment if needed

export default router;


