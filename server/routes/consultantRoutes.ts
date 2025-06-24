import express, { Router } from 'express';
import dotenv from 'dotenv';
import { getConsultants, getConsultantWithCategory, getConsultantById, getQualifications, getSpecialties, getConsulantCategory } from '../controllers/consultantController';


dotenv.config();

// Create router
const router: Router = express.Router();

// Get all consultants
router.get('/', getConsultants);

// Get qualifications
router.get('/qualifications', getQualifications)

// Get qualifications
router.get('/specialties', getSpecialties)

//get categories
router.get('/category', getConsultantWithCategory);

// Get consultant by ID
router.get('/:id', getConsultantById);

export default router;


