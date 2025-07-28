import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
const router = express.Router();


router.get('/', appointmentController.getAppointments);

router.get('/user/:id', appointmentController.getAppointmentByMemberId);

router.get('/consultant/:id', appointmentController.getAppointmentByConsultantId);

router.get('/filter', appointmentController.getAppointmentsByFilter);

router.put('/:appointmentId/approve', appointmentController.approveAppointment);

router.put('/:appointmentId/reject', appointmentController.rejectAppointment);

router.delete('/:appointmentId/cancel', appointmentController.cancelAppointment);

router.put('/:appointmentId/rate', appointmentController.rateAppointment);

router.put('/:appointmentId/complete', appointmentController.completeAppointment);

router.get('/:id', appointmentController.getAppointmentById);

router.post('/', appointmentController.bookAppointment);

router.get('/week/:userId/:week', appointmentController.getAppointmentByUserIdAndWeek);

export default router;