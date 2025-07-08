import { Router } from 'express';
import { saveAssessmentResult } from '../controllers/assessmentResultController';

const router = Router();

router.post('/assessment-results', saveAssessmentResult);

export default router;