import express, { Router } from 'express';
import dotenv from 'dotenv';
import { getConsultants, getConsultantWithCategory, getConsultantById, getQualifications, getSpecialties, updateConsultantSchedule, deleteConsultantSchedule, getPendingAppointments, addConsultantSchedule, getConsultantSchedule } from '../controllers/consultantController';

dotenv.config();

// Create router
const router: Router = express.Router();
// Get all consultants
router.get('/', getConsultants);

// Get qualifications - must be before /:id route
router.get('/qualifications', getQualifications);

// Get specialties - must be before /:id route
router.get('/specialties', getSpecialties);

// Get categories - must be before /:id route  
router.get('/category', getConsultantWithCategory);

// Schedule management routes - must be before /:id route
router.post('/schedules', addConsultantSchedule);
router.get('/schedules/:consultantId', getConsultantSchedule);
router.put('/schedules/:scheduleId', updateConsultantSchedule);
router.delete('/schedules/:scheduleId', deleteConsultantSchedule);

// Pending appointments - must be before /:id route
router.get('/pending-appointments/:consultantId', getPendingAppointments);

// Get consultant by ID - must be LAST as it's most general
router.get('/:id', getConsultantById);

export default router;