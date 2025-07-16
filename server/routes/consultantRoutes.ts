import express, { Router } from 'express';
import dotenv from 'dotenv';
import * as consultantController from '../controllers/consultantController';
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
// Get all consultants
router.get('/', consultantController.getConsultants);

/**
 * @route GET /api/consultants
 * @desc Lấy tất cả chuyên viên
 * @access Công khai
 */
router.get('/', getConsultants);

// Get qualifications - must be before /:id route
router.get('/qualifications', consultantController.getQualifications);
/**
 * @route GET /api/consultants/qualifications
 * @desc Lấy tất cả bằng cấp của chuyên viên
 * @access Công khai
 */
router.get('/qualifications', getQualifications);

// Get specialties - must be before /:id route
router.get('/specialties', consultantController.getSpecialties);
/**
 * @route GET /api/consultants/specialties
 * @desc Lấy tất cả chuyên môn của chuyên viên
 * @access Công khai
 */
router.get('/specialties', getSpecialties);

// Get categories - must be before /:id route  
router.get('/category', consultantController.getConsultantWithCategory);
/**
 * @route GET /api/consultants/category
 * @desc Lấy tất cả chuyên viên kèm danh mục
 * @access Công khai
 */
router.get('/category', getConsultantWithCategory);

// Schedule management routes - must be before /:id route
router.post('/schedule', consultantController.addConsultantSchedule);
/**
 * @route POST /api/consultants/schedule
 * @desc Thêm lịch làm việc cho chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.post('/schedule', addConsultantSchedule);

router.get('/schedules/:consultantId', consultantController.getConsultantSchedule);
/**
 * @route GET /api/consultants/schedules/:consultantId
 * @desc Lấy lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/schedules/:consultantId', getConsultantSchedule);

router.put('/schedules/:scheduleId', consultantController.updateConsultantSchedule);
/**
 * @route PUT /api/consultants/schedules/:scheduleId
 * @desc Cập nhật lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.put('/schedules/:scheduleId', updateConsultantSchedule);

router.delete('/schedules/:scheduleId', consultantController.deleteConsultantSchedule);
/**
 * @route DELETE /api/consultants/schedules/:scheduleId
 * @desc Xóa lịch làm việc của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.delete('/schedules/:scheduleId', deleteConsultantSchedule);

// Pending appointments - must be before /:id route
router.get('/pending-appointments/:consultantId', consultantController.getPendingAppointments);

router.get('/today-appointments/:consultantId', consultantController.getTodayAppointments);
/**
 * @route GET /api/consultants/pending-appointments/:consultantId
 * @desc Lấy danh sách cuộc hẹn chờ duyệt của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/pending-appointments/:consultantId', getPendingAppointments);

router.get('/week-appointments/:consultantId/:week', consultantController.getWeekAppointments);
/**
 * @route GET /api/consultants/today-appointments/:consultantId
 * @desc Lấy danh sách cuộc hẹn hôm nay của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/today-appointments/:consultantId', getTodayAppointments);

//compare last month and this month appointments
router.get('/compare-appointments/:consultantId', consultantController.compareAppointments);

router.get('/average-month-rating/:consultantId', consultantController.getAverageRating)
/**
 * @route GET /api/consultants/compare-appointments/:consultantId
 * @desc So sánh số lượng cuộc hẹn tháng này và tháng trước của chuyên viên
 * @access Công khai hoặc Quản trị viên
 */
router.get('/compare-appointments/:consultantId', compareAppointments);

// Get consultant by ID - must be LAST as it's most general
router.get('/:id', consultantController.getConsultantById);
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