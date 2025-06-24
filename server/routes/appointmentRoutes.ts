/**
 * Appointment-related API routes.
 * Provides endpoints for booking, retrieving, and managing appointments.
 *
 * @module routes/appointmentRoutes
 */
import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
const router = express.Router();

/**
 * @route GET /api/appointments
 * @desc Get all appointments
 * @access Public/User/Admin (as configured)
 */
router.get('/', appointmentController.getAppointments);

/**
 * @route GET /api/appointments/:id
 * @desc Get appointment details by ID
 * @access Public/User/Admin (as configured)
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @route POST /api/appointments
 * @desc Book a new appointment
 * @access User/Admin (as configured)
 */
router.post('/', appointmentController.bookAppointment);

export default router;