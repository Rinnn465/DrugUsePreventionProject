/**
 * Consultant-related API routes.
 * Provides endpoints for retrieving consultants, their qualifications, specialties, and schedules.
 *
 * @module routes/consultantRoutes
 */
import express, { Router } from 'express';
import dotenv from 'dotenv';
import { getConsultants, getConsultantById, getQualifications, getSpecialties } from '../controllers/consultantController';
import * as consultantScheduleController from '../controllers/consultantScheduleController'; // Ensure this file exists
// Update the import path if the file is named differently or in another location
// Example: If the file is named consultant-schedule.controller.ts
// import { getConsultantSchedule } from '../controllers/consultant-schedule.controller';

// If the file does not exist, create it with the following content:

dotenv.config();

// Create router instance for consultant endpoints
const router: Router = express.Router();

/**
 * @route GET /api/consultants
 * @desc Get all consultants
 * @access Public
 */
router.get('/', getConsultants);

/**
 * @route GET /api/consultants/qualifications
 * @desc Get all consultant qualifications
 * @access Public
 */
router.get('/qualifications', getQualifications)

/**
 * @route GET /api/consultants/specialties
 * @desc Get all consultant specialties
 * @access Public
 */
router.get('/specialties', getSpecialties)

/**
 * @route GET /api/consultants/:id
 * @desc Get consultant by ID
 * @access Public
 */
router.get('/:id', getConsultantById);

/**
 * @route GET /api/consultants/:id/schedule
 * @desc Get consultant's schedule by consultant ID
 * @access Public
 */
router.get('/:id/schedule', consultantScheduleController.getConsultantScheduleByScheduleId);

/**
 * @route GET /api/consultants/schedule
 * @desc Get all consultants' schedules
 * @access Public
 */
router.get('/schedule', consultantScheduleController.getConsultantSchedules);

/**
 * @route GET /api/consultants/schedule/:consultantId
 * @desc Get schedule for a specific consultant by ID
 * @access Public
 */
 router.get('/schedule/:consultantId', consultantScheduleController.getConsultantSchedulesByConsultantId); // Uncomment if needed

/**
 * @route POST /api/consultants/schedule
 * @desc Create a new consultant schedule
 * @access Consultant
 */
router.post('/schedule', consultantScheduleController.createConsultantSchedule); // Uncomment if needed

/**
 * @route PUT /api/consultants/schedule/:id
 * @desc Update a consultant's schedule by ID
 * @access Consultant
 */
router.put('/schedule/:id', consultantScheduleController.updateConsultantSchedule); // Uncomment if needed

/**
 * @route DELETE /api/consultants/schedule/:id
 * @desc Delete a consultant's schedule by ID
 * @access Consultant
 */
router.delete('/schedule/:id', consultantScheduleController.deleteConsultantSchedule); // Uncomment if needed

export default router;


