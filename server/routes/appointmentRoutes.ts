import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
const router = express.Router();

router.get('/', appointmentController.getAppointments);

router.get('/filter', appointmentController.getAppointmentsByFilter);

router.get('/:id', appointmentController.getAppointmentById);

router.post('/', appointmentController.bookAppointment);


export default router;