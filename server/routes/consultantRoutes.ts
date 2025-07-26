import express, { Router } from 'express';
import dotenv from 'dotenv';
import * as consultantController from '../controllers/consultantController';

dotenv.config();

// Create router
const router: Router = express.Router();
// Get all consultants
router.get('/', consultantController.getConsultants);


// Get qualifications - must be before /:id route
router.get('/qualifications', consultantController.getQualifications);
router.get('/qualifications/:id', consultantController.getConsultantQualificationByConsultantId);


// Get specialties - must be before /:id route
router.get('/specialties', consultantController.getSpecialties);
router.get('/specialties/:id', consultantController.getConsultantSpecialtyById);


// Get categories - must be before /:id route  
router.get('/category', consultantController.getConsultantWithCategory);


// Schedule management routes - must be before /:id route
router.post('/schedule', consultantController.addConsultantSchedule);


router.get('/schedules/:consultantId', consultantController.getConsultantSchedule);


router.put('/schedules/:scheduleId', consultantController.updateConsultantSchedule);


router.delete('/schedules/:scheduleId', consultantController.deleteConsultantSchedule);


// Pending appointments - must be before /:id route
router.get('/pending-appointments/:consultantId', consultantController.getPendingAppointments);

router.get('/today-appointments/:consultantId', consultantController.getTodayAppointments);


router.get('/week-appointments/:consultantId/:week', consultantController.getWeekAppointments);


//compare last month and this month appointments
router.get('/compare-appointments/:consultantId', consultantController.compareAppointments);

router.get('/average-month-rating/:consultantId', consultantController.getAverageRating)

router.get('/average-all-rating/:consultantId', consultantController.getAverageAllRating);


// Get consultant by ID - must be LAST as it's most general
router.get('/:id', consultantController.getConsultantById);



export default router;