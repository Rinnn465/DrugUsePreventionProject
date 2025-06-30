import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import e, { Request, Response } from 'express';

dotenv.config();

/**
 * Lấy tất cả bài học của một khóa học cụ thể
 * 
 * @route GET /api/lessons/course/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLesson(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params của request
    const courseId = req.params.id;
    // In ra log để kiểm tra courseId nhận được
    console.log(`Fetching lessons for course ID: ${courseId}`);

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Truy vấn lấy tất cả bài học thuộc CourseID, dùng parameter để tránh SQL injection
        const result = await pool.request()
            .input('CourseId', Number(courseId)) // Gán giá trị CourseId vào query
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId'); // Truy vấn lấy bài học
        // Trả về kết quả thành công với dữ liệu bài học
        res.status(200).json({ 
            message: 'Courses fetched successfully', 
            data: result.recordset 
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, in ra log và trả về lỗi 500
        console.error('Error in getLesson:', err);
        res.status(500).json({ 
            message: 'Error fetching courses', 
            error: err.message 
        });
        return;
    }
}

/**
 * Lấy nội dung bài học và các câu hỏi cho một khóa học cụ thể
 * 
 * @route GET /api/lessons/content/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với nội dung bài học và câu hỏi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonContent(req: Request, res: Response): Promise<void> {
    // Lấy id khóa học từ params
    const { id } = req.params;

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Truy vấn phức tạp: lấy tất cả câu hỏi thuộc các bài học của khóa học này
        const result = await pool.request()
            .input('CourseId', Number(id)) // Gán giá trị CourseId vào query
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`); // Truy vấn lấy câu hỏi của các bài học thuộc khóa học
        // Trả về kết quả thành công với dữ liệu câu hỏi
        res.status(200).json({ 
            message: 'Lesson content fetched successfully', 
            data: result.recordset 
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, in ra log và trả về lỗi 500
        console.error('Error in getLessonContent:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson content', 
            error: err.message 
        });
        return;
    }
}

/**
 * Lấy tất cả câu hỏi của một bài học cụ thể
 * 
 * @route GET /api/lessons/questions/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa lesson ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách câu hỏi của bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
    // Lấy lessonId từ params
    const lessonId = req.params.id;
    // In ra log để kiểm tra lessonId nhận được
    console.log(`Fetching questions for lesson ID: ${lessonId}`);

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Truy vấn lấy tất cả câu hỏi thuộc bài học này (theo lessonId)
        const result = await pool.request()
            .input('LessonID', Number(lessonId)) // Gán giá trị LessonID vào query
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`); // Truy vấn lấy câu hỏi của các bài học thuộc khóa học

        // Trả về kết quả thành công với dữ liệu câu hỏi
        res.status(200).json({ 
            message: 'Lesson questions fetched successfully', 
            data: result.recordset 
        });
    } catch (err: any) {
        // Nếu có lỗi, in ra log và trả về lỗi 500
        console.error('Error in getQuestions:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson questions', 
            error: err.message 
        });
    }
}

/**
 * Lấy tất cả đáp án cho các câu hỏi trong một khóa học cụ thể
 * 
 * @route GET /api/lessons/answers/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách đáp án
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getAnswers(req: Request, res: Response): Promise<void> {
    // Lấy id khóa học từ params
    const { id } = req.params;
    // In ra log để kiểm tra id nhận được
    console.log(`Fetching answers for question ID: ${id}`);

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Truy vấn phức tạp: lấy tất cả đáp án của các câu hỏi thuộc các bài học của khóa học này
        const result = await pool.request()
            .input('CourseID', id) // Gán giá trị CourseID vào query
            .query(`
            SELECT * 
            FROM LessonAnswer 
            WHERE QuestionID IN (
                SELECT lq.QuestionID 
                FROM Lesson l
                JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                WHERE l.CourseID = @CourseID
            );`); // Truy vấn lấy đáp án của các câu hỏi thuộc các bài học của khóa học

        // Trả về kết quả thành công với dữ liệu đáp án
        res.status(200).json({ 
            message: 'Lesson answers fetched successfully', 
            data: result.recordset 
        });
    } catch (err: any) {
        // Nếu có lỗi, in ra log và trả về lỗi 500
        console.error('Error in getAnswers:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson answers', 
            error: err.message 
        });
    }
}

/**
 * Tạo mới một bài học
 * 
 * @route POST /api/lesson
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - Dữ liệu bài học trong body
 * @param {Response} res - Kết quả trả về
 */
export async function createLesson(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu bài học từ body của request
    const { CourseID, Title, BriefDescription, Content, Duration, VideoUrl, Status, IsDisabled } = req.body;
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thêm bài học mới vào bảng Lesson, sử dụng parameter để tránh SQL injection
        const result = await pool.request()
            .input('CourseID', sql.Int, CourseID)
            .input('Title', sql.NVarChar, Title)
            .input('BriefDescription', sql.NVarChar, BriefDescription)
            .input('Content', sql.NVarChar, Content)
            .input('Duration', sql.Int, Duration)
            .input('VideoUrl', sql.NVarChar, VideoUrl)
            .input('Status', sql.NVarChar, Status)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`INSERT INTO Lesson (CourseID, Title, BriefDescription, Content, Duration, VideoUrl, Status, IsDisabled)
                    OUTPUT INSERTED.*
                    VALUES (@CourseID, @Title, @BriefDescription, @Content, @Duration, @VideoUrl, @Status, @IsDisabled)`); // Truy vấn thêm mới bài học
        // Trả về bài học vừa tạo thành công
        res.status(201).json({ message: 'Tạo bài học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi tạo bài học', error: err.message });
    }
}

/**
 * Cập nhật bài học theo ID
 * 
 * @route PUT /api/lesson/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID bài học trong params, dữ liệu cập nhật trong body
 * @param {Response} res - Kết quả trả về
 */
export async function updateLesson(req: Request, res: Response): Promise<void> {
    // Lấy lessonId từ params
    const lessonId = Number(req.params.id);
    if (isNaN(lessonId)) {
        res.status(400).json({ message: 'lessonId không hợp lệ' });
        return;
    }
    // Lấy dữ liệu cập nhật từ body
    const fields = req.body;
    if (!fields || Object.keys(fields).length === 0) {
        res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
        return;
    }
    // Tạo câu lệnh cập nhật động và tham số
    const updates: string[] = [];
    const params: any = { LessonID: lessonId };
    Object.entries(fields).forEach(([key, value]) => {
        updates.push(`${key} = @${key}`);
        params[key] = value;
    });
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Tạo câu lệnh SQL cập nhật động
        const sqlUpdate = `
            UPDATE Lesson SET ${updates.join(', ')}
            WHERE LessonID = @LessonID;
            SELECT * FROM Lesson WHERE LessonID = @LessonID
        `;
        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });
        // Thực thi truy vấn cập nhật
        const result = await request.query(sqlUpdate);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }
        // Trả về bài học đã cập nhật
        res.status(200).json({ message: 'Cập nhật bài học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi cập nhật bài học', error: err.message });
    }
}

/**
 * Xoá bài học theo ID
 * 
 * @route DELETE /api/lesson/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID bài học trong params
 * @param {Response} res - Kết quả trả về
 */
export async function deleteLesson(req: Request, res: Response): Promise<void> {
    // Lấy lessonId từ params
    const lessonId = Number(req.params.id);
    if (isNaN(lessonId)) {
        res.status(400).json({ message: 'lessonId không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thực hiện truy vấn xoá bài học theo LessonID
        const result = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .query('DELETE FROM Lesson WHERE LessonID = @LessonID');
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }
        // Trả về kết quả xoá thành công
        res.status(200).json({ message: 'Xoá bài học thành công' });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi xoá bài học', error: err.message });
    }
}

/**
 * Tạo mới câu hỏi cho bài học
 * 
 * @route POST /api/lesson/question
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - Dữ liệu câu hỏi trong body
 * @param {Response} res - Kết quả trả về
 */
export async function createLessonQuestion(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu câu hỏi từ body
    const { LessonID, QuestionText, Type, IsDisabled } = req.body;
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Thêm câu hỏi mới vào bảng LessonQuestion
        const result = await pool.request()
            .input('LessonID', sql.Int, LessonID)
            .input('QuestionText', sql.NVarChar, QuestionText)
            .input('Type', sql.NVarChar, Type)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`INSERT INTO LessonQuestion (LessonID, QuestionText, Type, IsDisabled)
                    OUTPUT INSERTED.*
                    VALUES (@LessonID, @QuestionText, @Type, @IsDisabled)`); // Truy vấn thêm mới câu hỏi
        // Trả về câu hỏi vừa tạo thành công
        res.status(201).json({ message: 'Tạo câu hỏi thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi', error: err.message });
    }
}

/**
 * Cập nhật câu hỏi bài học
 * 
 * @route PUT /api/lesson/question/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID câu hỏi trong params, dữ liệu cập nhật trong body
 * @param {Response} res - Kết quả trả về
 */
export async function updateLessonQuestion(req: Request, res: Response): Promise<void> {
    // Lấy questionId từ params
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
        res.status(400).json({ message: 'questionId không hợp lệ' });
        return;
    }
    // Lấy dữ liệu cập nhật từ body
    const fields = req.body;
    if (!fields || Object.keys(fields).length === 0) {
        res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
        return;
    }
    // Tạo câu lệnh cập nhật động và tham số
    const updates: string[] = [];
    const params: any = { QuestionID: questionId };
    Object.entries(fields).forEach(([key, value]) => {
        updates.push(`${key} = @${key}`);
        params[key] = value;
    });
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Tạo câu lệnh SQL cập nhật động
        const sqlUpdate = `
            UPDATE LessonQuestion SET ${updates.join(', ')}
            WHERE QuestionID = @QuestionID;
            SELECT * FROM LessonQuestion WHERE QuestionID = @QuestionID
        `;
        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });
        // Thực thi truy vấn cập nhật
        const result = await request.query(sqlUpdate);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
            return;
        }
        // Trả về câu hỏi đã cập nhật
        res.status(200).json({ message: 'Cập nhật câu hỏi thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi cập nhật câu hỏi', error: err.message });
    }
}

/**
 * Xoá câu hỏi bài học
 * 
 * @route DELETE /api/lesson/question/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID câu hỏi trong params
 * @param {Response} res - Kết quả trả về
 */
export async function deleteLessonQuestion(req: Request, res: Response): Promise<void> {
    // Lấy questionId từ params
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
        res.status(400).json({ message: 'questionId không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thực hiện truy vấn xoá câu hỏi theo QuestionID
        const result = await pool.request()
            .input('QuestionID', sql.Int, questionId)
            .query('DELETE FROM LessonQuestion WHERE QuestionID = @QuestionID');
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
            return;
        }
        // Trả về kết quả xoá thành công
        res.status(200).json({ message: 'Xoá câu hỏi thành công' });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi xoá câu hỏi', error: err.message });
    }
}

/**
 * Tạo mới đáp án cho câu hỏi
 * 
 * @route POST /api/lesson/answer
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - Dữ liệu đáp án trong body
 * @param {Response} res - Kết quả trả về
 */
export async function createLessonAnswer(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu đáp án từ body
    const { QuestionID, AnswerText, IsCorrect, IsDisabled } = req.body;
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thêm đáp án mới vào bảng LessonAnswer
        const result = await pool.request()
            .input('QuestionID', sql.Int, QuestionID)
            .input('AnswerText', sql.NVarChar, AnswerText)
            .input('IsCorrect', sql.Bit, IsCorrect)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`INSERT INTO LessonAnswer (QuestionID, AnswerText, IsCorrect, IsDisabled)
                    OUTPUT INSERTED.*
                    VALUES (@QuestionID, @AnswerText, @IsCorrect, @IsDisabled)`); // Truy vấn thêm mới đáp án
        // Trả về đáp án vừa tạo thành công
        res.status(201).json({ message: 'Tạo đáp án thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi tạo đáp án', error: err.message });
    }
}

/**
 * Cập nhật đáp án câu hỏi
 * 
 * @route PUT /api/lesson/answer/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID đáp án trong params, dữ liệu cập nhật trong body
 * @param {Response} res - Kết quả trả về
 */
export async function updateLessonAnswer(req: Request, res: Response): Promise<void> {
    // Lấy answerId từ params
    const answerId = Number(req.params.id);
    if (isNaN(answerId)) {
        res.status(400).json({ message: 'answerId không hợp lệ' });
        return;
    }
    // Lấy dữ liệu cập nhật từ body
    const fields = req.body;
    if (!fields || Object.keys(fields).length === 0) {
        res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
        return;
    }
    // Tạo câu lệnh cập nhật động và tham số
    const updates: string[] = [];
    const params: any = { AnswerID: answerId };
    Object.entries(fields).forEach(([key, value]) => {
        updates.push(`${key} = @${key}`);
        params[key] = value;
    });
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Tạo câu lệnh SQL cập nhật động
        const sqlUpdate = `
            UPDATE LessonAnswer SET ${updates.join(', ')}
            WHERE AnswerID = @AnswerID;
            SELECT * FROM LessonAnswer WHERE AnswerID = @AnswerID
        `;
        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });
        // Thực thi truy vấn cập nhật
        const result = await request.query(sqlUpdate);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy đáp án' });
            return;
        }
        // Trả về đáp án đã cập nhật
        res.status(200).json({ message: 'Cập nhật đáp án thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi cập nhật đáp án', error: err.message });
    }
}

/**
 * Xoá đáp án câu hỏi
 * 
 * @route DELETE /api/lesson/answer/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID đáp án trong params
 * @param {Response} res - Kết quả trả về
 */
export async function deleteLessonAnswer(req: Request, res: Response): Promise<void> {
    // Lấy answerId từ params
    const answerId = Number(req.params.id);
    if (isNaN(answerId)) {
        res.status(400).json({ message: 'answerId không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thực hiện truy vấn xoá đáp án theo AnswerID
        const result = await pool.request()
            .input('AnswerID', sql.Int, answerId)
            .query('DELETE FROM LessonAnswer WHERE AnswerID = @AnswerID');
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy đáp án' });
            return;
        }
        // Trả về kết quả xoá thành công
        res.status(200).json({ message: 'Xoá đáp án thành công' });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi xoá đáp án', error: err.message });
    }
}