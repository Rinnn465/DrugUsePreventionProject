import { Router } from 'express';
import { saveAssessmentResult, getAssessmentResult, deleteAssessmentResult, getAssessmentResultByAssessment, deleteAssessmentResultByAssessment } from '../controllers/assessmentResultController';
import authorizeRoles from '../middleware/authenMiddleware';

const router = Router();

// Create/Update
router.post('/assessment-results', saveAssessmentResult);

// Update (riêng nếu cần, nhưng hiện tại hợp nhất với POST)
router.put('/assessment-results/:resultId', saveAssessmentResult);

// Read by assessmentId for current user - Cho phép tất cả các role hợp lệ
router.get('/assessment-results/by-assessment/:assessmentId', authorizeRoles(['Member', 'Consultant', 'Admin', 'Staff', 'Manager']), getAssessmentResultByAssessment);

// Read - Chỉ cho Consultant và Admin  
router.get('/assessment-results/:resultId', authorizeRoles(['Consultant', 'Admin']), getAssessmentResult);

// Delete - Chỉ cho Consultant và Admin
router.delete('/assessment-results/:resultId', authorizeRoles(['Consultant', 'Admin']), deleteAssessmentResult);

// Delete assessment result by assessmentId for current user - Cho phép tất cả các role hợp lệ
router.delete('/assessment-results/by-assessment/:assessmentId', authorizeRoles(['Member', 'Consultant', 'Admin', 'Staff', 'Manager']), deleteAssessmentResultByAssessment);

export default router;