import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
const router = express.Router();


router.get('/', appointmentController.getAppointments);

router.get('/user/:id', appointmentController.getAppointmentByUserId);

router.get('/filter', appointmentController.getAppointmentsByFilter);

router.put('/:appointmentId/approve', appointmentController.approveAppointment);

router.put('/:appointmentId/reject', appointmentController.rejectAppointment);

router.delete('/:appointmentId/cancel', appointmentController.cancelAppointment);

router.get('/:id', appointmentController.getAppointmentById);

router.post('/', appointmentController.bookAppointment);

export default router;