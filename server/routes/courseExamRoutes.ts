import express from 'express';
import { 
    getCourseExam, 
    submitExam, 
    getExamResult, 
    getExamResultsByAccount
} from '../controllers/courseExamController';

const router = express.Router();

/**
 * @route GET /api/exam/course/:id
 * @desc Lấy thông tin bài thi của khóa học
 * @access Thành viên
 */
router.get('/course/:id', getCourseExam);

/**
 * @route POST /api/exam/submit
 * @desc Nộp bài thi
 * @access Thành viên
 */
router.post('/submit', submitExam);

/**
 * @route GET /api/exam/result/:examId/:accountId
 * @desc Lấy kết quả thi cụ thể
 * @access Thành viên
 */
router.get('/result/:examId/:accountId', getExamResult);

/**
 * @route GET /api/exam/results/:accountId
 * @desc Lấy tất cả kết quả thi của học viên
 * @access Thành viên
 */
router.get('/results/:accountId', getExamResultsByAccount);

export default router;
