import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import { Request, Response } from 'express';

dotenv.config();

/**
 * Lấy thông tin bài thi của một khóa học cụ thể
 * 
 * @route GET /api/exam/course/:id
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin bài thi
 * @throws {404} Nếu không tìm thấy bài thi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourseExam(req: Request, res: Response): Promise<void> {
    const courseId = Number(req.params.id);
    
    if (isNaN(courseId)) {
        res.status(400).json({ 
            message: 'ID khóa học không hợp lệ'
        });
        return;
    }

    try {
        const pool = await poolPromise;
        
        // Lấy thông tin bài thi của khóa học
        const examResult = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .query(`
                SELECT ExamID, CourseID, ExamTitle, ExamDescription, PassingScore, IsDisabled
                FROM CourseExam 
                WHERE CourseID = @CourseId AND IsDisabled = 0
            `);

        if (examResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài thi cho khóa học này' });
            return;
        }

        const exam = examResult.recordset[0];

        // Lấy các câu hỏi và đáp án của bài thi
        const questionsResult = await pool.request()
            .input('ExamId', sql.Int, exam.ExamID)
            .query(`
                SELECT 
                    q.QuestionID, q.QuestionText, q.Type,
                    a.AnswerID, a.AnswerText, a.IsCorrect
                FROM ExamQuestion q
                LEFT JOIN ExamAnswer a ON q.QuestionID = a.QuestionID AND a.IsDisabled = 0
                WHERE q.ExamID = @ExamId AND q.IsDisabled = 0
                ORDER BY q.QuestionID, a.AnswerID
            `);

        // Nhóm các câu hỏi và đáp án
        const questionsMap = new Map();
        questionsResult.recordset.forEach(row => {
            if (!questionsMap.has(row.QuestionID)) {
                questionsMap.set(row.QuestionID, {
                    QuestionID: row.QuestionID,
                    QuestionText: row.QuestionText,
                    Type: row.Type,
                    Answers: []
                });
            }
            
            if (row.AnswerID) {
                questionsMap.get(row.QuestionID).Answers.push({
                    AnswerID: row.AnswerID,
                    AnswerText: row.AnswerText,
                    IsCorrect: row.IsCorrect
                });
            }
        });

        const questions = Array.from(questionsMap.values());

        res.status(200).json({
            message: 'Lấy thông tin bài thi thành công',
            data: {
                ...exam,
                Questions: questions
            }
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong getCourseExam:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin bài thi',
            error: err.message
        });
        return;
    }
}

/**
 * Nộp bài thi và tính điểm
 * 
 * @route POST /api/exam/submit
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa thông tin bài thi trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả thi
 * @throws {404} Nếu không tìm thấy bài thi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function submitExam(req: Request, res: Response): Promise<void> {
    const { examId, accountId, answers } = req.body;

    if (!examId || !accountId || !answers || !Array.isArray(answers)) {
        res.status(400).json({ message: 'Dữ liệu bài thi không hợp lệ' });
        return;
    }

    try {
        const pool = await poolPromise;

        // Lấy thông tin bài thi và điểm tối thiểu
        const examResult = await pool.request()
            .input('ExamId', sql.Int, examId)
            .query(`
                SELECT ExamID, CourseID, PassingScore
                FROM CourseExam 
                WHERE ExamID = @ExamId AND IsDisabled = 0
            `);

        if (examResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài thi' });
            return;
        }

        const exam = examResult.recordset[0];

        // Lấy đáp án đúng
        const correctAnswersResult = await pool.request()
            .input('ExamId', sql.Int, examId)
            .query(`
                SELECT q.QuestionID, a.AnswerID
                FROM ExamQuestion q
                JOIN ExamAnswer a ON q.QuestionID = a.QuestionID
                WHERE q.ExamID = @ExamId AND a.IsCorrect = 1 AND q.IsDisabled = 0 AND a.IsDisabled = 0
            `);

        // Tạo map đáp án đúng
        const correctAnswersMap = new Map();
        correctAnswersResult.recordset.forEach(row => {
            if (!correctAnswersMap.has(row.QuestionID)) {
                correctAnswersMap.set(row.QuestionID, []);
            }
            correctAnswersMap.get(row.QuestionID).push(row.AnswerID);
        });

        // Tính điểm
        let correctCount = 0;
        const totalQuestions = correctAnswersMap.size;
        
        answers.forEach((answer: any) => {
            const questionId = answer.questionId;
            const selectedAnswers = Array.isArray(answer.selectedAnswers) ? answer.selectedAnswers : [answer.selectedAnswers];
            const correctAnswers = correctAnswersMap.get(questionId) || [];
            
            // Kiểm tra đáp án có đúng không
            if (selectedAnswers.length === correctAnswers.length &&
                selectedAnswers.every((id: number) => correctAnswers.includes(id))) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const isPassed = score >= exam.PassingScore;

        // Lưu kết quả thi và lấy ResultID
        const insertResult = await pool.request()
            .input('ExamId', sql.Int, examId)
            .input('AccountId', sql.Int, accountId)
            .input('CorrectAnswers', sql.Int, correctCount)
            .input('IsPassed', sql.Bit, isPassed)
            .input('AnswerData', sql.NVarChar(sql.MAX), JSON.stringify(answers))
            .query(`
                INSERT INTO ExamResult (ExamID, AccountID, CorrectAnswers, IsPassed, AnswerData)
                OUTPUT INSERTED.ResultID
                VALUES (@ExamId, @AccountId, @CorrectAnswers, @IsPassed, @AnswerData)
            `);

        const resultId = insertResult.recordset[0].ResultID;

        res.status(200).json({
            message: 'Nộp bài thi thành công',
            resultId: resultId,
            correctAnswers: correctCount,
            totalQuestions: totalQuestions,
            isPassed: isPassed,
            data: {
                examId,
                accountId,
                score,
                correctCount,
                totalQuestions,
                isPassed,
                passingScore: exam.PassingScore
            }
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong submitExam:', err);
        res.status(500).json({
            message: 'Lỗi khi nộp bài thi',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy kết quả thi của học viên
 * 
 * @route GET /api/exam/result/:examId/:accountId
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả thi
 * @throws {404} Nếu không tìm thấy kết quả thi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getExamResult(req: Request, res: Response): Promise<void> {
    const examId = Number(req.params.examId);
    const accountId = Number(req.params.accountId);

    if (isNaN(examId) || isNaN(accountId)) {
        res.status(400).json({ message: 'ID không hợp lệ' });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ExamId', sql.Int, examId)
            .input('AccountId', sql.Int, accountId)
            .query(`
                SELECT 
                    er.ResultID, er.ExamID, er.AccountID, er.CorrectAnswers, 
                    er.IsPassed, er.AnswerData,
                    ce.ExamTitle, ce.PassingScore, ce.CourseID,
                    c.CourseName
                FROM ExamResult er
                JOIN CourseExam ce ON er.ExamID = ce.ExamID
                JOIN Course c ON ce.CourseID = c.CourseID
                WHERE er.ExamID = @ExamId AND er.AccountID = @AccountId
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy kết quả thi' });
            return;
        }

        const examResult = result.recordset[0];
        
        // Parse AnswerData nếu có
        let answerData = null;
        if (examResult.AnswerData) {
            try {
                answerData = JSON.parse(examResult.AnswerData);
            } catch (parseError) {
                console.error('Lỗi parse AnswerData:', parseError);
            }
        }

        res.status(200).json({
            message: 'Lấy kết quả thi thành công',
            data: {
                ...examResult,
                AnswerData: answerData
            }
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong getExamResult:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy kết quả thi',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy tất cả kết quả thi của một học viên
 * 
 * @route GET /api/exam/results/:accountId
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách kết quả thi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getExamResultsByAccount(req: Request, res: Response): Promise<void> {
    const accountId = Number(req.params.accountId);

    if (isNaN(accountId)) {
        res.status(400).json({ message: 'ID tài khoản không hợp lệ' });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('AccountId', sql.Int, accountId)
            .query(`
                SELECT 
                    er.ResultID, er.ExamID, er.AccountID, er.CorrectAnswers, 
                    er.IsPassed,
                    ce.ExamTitle, ce.PassingScore, ce.CourseID,
                    c.CourseName
                FROM ExamResult er
                JOIN CourseExam ce ON er.ExamID = ce.ExamID
                JOIN Course c ON ce.CourseID = c.CourseID
                WHERE er.AccountID = @AccountId
                ORDER BY er.ResultID DESC
            `);

        res.status(200).json({
            message: 'Lấy danh sách kết quả thi thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong getExamResultsByAccount:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách kết quả thi',
            error: err.message
        });
        return;
    }
}
