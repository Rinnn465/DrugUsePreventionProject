/**
 * Các route API liên quan đến lịch hẹn.
 * Cung cấp các endpoint để đặt, lấy và quản lý lịch hẹn.
 *
 * @module routes/appointmentRoutes
 */
import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
const router = express.Router();

/**
 * @route GET /api/appointments
 * @desc Lấy tất cả lịch hẹn
 * @access Công khai
 */
/**
 * @route GET /api/appointments
 * @desc Lấy tất cả lịch hẹn
 * @access Công khai/Người dùng/Quản trị viên (tùy cấu hình)
 */
router.get('/', appointmentController.getAppointments);

/**
 * @route GET /api/appointments/user/:id
 * @desc Lấy lịch hẹn theo user
 * @access Công khai
 */
router.get('/user/:id', appointmentController.getAppointmentByUserId);

/**
 * @route GET /api/appointments/filter
 * @desc Lọc lịch hẹn
 * @access Công khai
 */
router.get('/filter', appointmentController.getAppointmentsByFilter);

/**
 * @route PUT /api/appointments/:appointmentId/approve
 * @desc Duyệt lịch hẹn
 * @access Công khai hoặc Admin
 */
router.put('/:appointmentId/approve', appointmentController.approveAppointment);

/**
 * @route PUT /api/appointments/:appointmentId/reject
 * @desc Từ chối lịch hẹn
 * @access Công khai hoặc Admin
 */
router.put('/:appointmentId/reject', appointmentController.rejectAppointment);

/**
 * @route DELETE /api/appointments/:appointmentId/cancel
 * @desc Huỷ lịch hẹn
 * @access Công khai hoặc Admin
 */
router.delete('/:appointmentId/cancel', appointmentController.cancelAppointment);

/**
 * @route GET /api/appointments/:id
 * @desc Lấy lịch hẹn theo ID
 * @access Công khai
 */
/**
 * @route GET /api/appointments/:id
 * @desc Lấy chi tiết lịch hẹn theo ID
 * @access Công khai/Người dùng/Quản trị viên (tùy cấu hình)
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @route POST /api/appointments
 * @desc Đặt lịch hẹn mới
 * @access Công khai
 */
/**
 * @route POST /api/appointments
 * @desc Đặt lịch hẹn mới
 * @access Người dùng/Quản trị viên (tùy cấu hình)
 */
router.post('/', appointmentController.bookAppointment);

export default router;