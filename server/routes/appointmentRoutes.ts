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
 * @access Công khai/Người dùng/Quản trị viên (tùy cấu hình)
 */
router.get('/', appointmentController.getAppointments);

/**
 * @route GET /api/appointments/:id
 * @desc Lấy chi tiết lịch hẹn theo ID
 * @access Công khai/Người dùng/Quản trị viên (tùy cấu hình)
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @route POST /api/appointments
 * @desc Đặt lịch hẹn mới
 * @access Người dùng/Quản trị viên (tùy cấu hình)
 */
router.post('/', appointmentController.bookAppointment);

export default router;