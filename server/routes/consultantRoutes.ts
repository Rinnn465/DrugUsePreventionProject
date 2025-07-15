import express, { Router } from 'express';
import dotenv from 'dotenv';
import {
    getConsultants,
    getConsultantWithCategory,
    getConsultantById, getQualifications,
    getSpecialties, updateConsultantSchedule, deleteConsultantSchedule,
    getPendingAppointments, addConsultantSchedule, getConsultantSchedule,
    getTodayAppointments, compareAppointments,
    getMonthlyAppointmentStatistics
} from '../controllers/consultantController';

dotenv.config();

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/consultants
 * @desc Lấy tất cả chuyên viên
 * @access Công khai
 */
router.get('/', getConsultants);

/**
 * @route GET /api/consultants/qualifications
 * @desc Lấy tất cả bằng cấp của chuyên viên
 * @access Công khai
 */
router.get('/qualifications', getQualifications);

/**
 * @route GET /api/consultants/specialties
 * @desc Lấy tất cả chuyên môn của chuyên viên
 * @access Công khai
 */
router.get('/specialties', getSpecialties);

/**
 * @route GET /api/consultants/category
 * @desc Lấy tất cả chuyên viên kèm danh mục
 * @access Công khai
 */
router.get('/category', getConsultantWithCategory);

/**
 * @route POST /api/consultants/schedule
 * @desc Thêm lịch làm việc cho chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.post('/schedule', addConsultantSchedule);

/**
 * @route GET /api/consultants/schedules/:consultantId
 * @desc Lấy lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/schedules/:consultantId', getConsultantSchedule);

/**
 * @route PUT /api/consultants/schedules/:scheduleId
 * @desc Cập nhật lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.put('/schedules/:scheduleId', updateConsultantSchedule);

/**
 * @route DELETE /api/consultants/schedules/:scheduleId
 * @desc Xóa lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.delete('/schedules/:scheduleId', deleteConsultantSchedule);

/**
 * @route GET /api/consultants/pending-appointments/:consultantId
 * @desc Lấy danh sách cuộc hẹn chờ duyệt của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/pending-appointments/:consultantId', getPendingAppointments);

/**
 * @route GET /api/consultants/today-appointments/:consultantId
 * @desc Lấy danh sách cuộc hẹn hôm nay của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/today-appointments/:consultantId', getTodayAppointments);

/**
 * @route GET /api/consultants/compare-appointments/:consultantId
 * @desc So sánh số lượng cuộc hẹn tháng này và tháng trước của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/compare-appointments/:consultantId', compareAppointments);

/**
 * @route GET /api/consultant/statistics/month-appointments/:consultantId
 * @desc Thống kê số lịch hẹn trong tháng của một chuyên viên
 * @access Chỉ Admin, Staff, Manager
 */
router.get('/statistics/month-appointments/:consultantId', getMonthlyAppointmentStatistics);

/**
 * @route GET /api/consultants/:id
 * @desc Lấy thông tin chuyên viên theo ID
 * @access Công khai
 */
router.get('/:id', getConsultantById);

export default router;