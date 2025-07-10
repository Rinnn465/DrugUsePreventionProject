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
 * @throws {400} Nếu ID không hợp lệ
 * @throws {404} Nếu không tìm thấy bài học nào
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLesson(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params của request
    const courseId = Number(req.params.id);

    if (isNaN(courseId)) {
        res.status(400).json({ message: 'ID khóa học không hợp lệ' });
        return;
    }

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;

        // Truy vấn lấy tất cả bài học thuộc CourseID, bao gồm cả trạng thái
        const result = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .query(`
                SELECT 
                    LessonID, 
                    CourseID, 
                    Title, 
                    BriefDescription, 
                    Content, 
                    Duration, 
                    VideoUrl, 
                    Status, 
                    IsDisabled
                FROM Lesson l 
                WHERE CourseID = @CourseId AND IsDisabled = 0
                ORDER BY LessonID
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học nào cho khóa học này' });
            return;
        }

        // Trả về kết quả thành công với dữ liệu bài học
        res.status(200).json({
            message: 'Lấy danh sách bài học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, in ra log và trả về lỗi 500
        console.error('Error in getLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách bài học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy chi tiết một bài học cụ thể
 * 
 * @route GET /api/lessons/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa lesson ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài học
 * @throws {400} Nếu ID không hợp lệ
 * @throws {404} Nếu không tìm thấy bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonById(req: Request, res: Response): Promise<void> {
    const lessonId = Number(req.params.id);

    if (isNaN(lessonId)) {
        res.status(400).json({ message: 'ID bài học không hợp lệ' });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('LessonId', sql.Int, lessonId)
            .query(`
                SELECT 
                    l.LessonID, 
                    l.CourseID, 
                    l.Title, 
                    l.BriefDescription, 
                    l.Content, 
                    l.Duration, 
                    l.VideoUrl, 
                    l.Status, 
                    l.IsDisabled,
                    c.CourseName
                FROM Lesson l
                JOIN Course c ON l.CourseID = c.CourseID
                WHERE l.LessonID = @LessonId AND l.IsDisabled = 0
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }

        res.status(200).json({
            message: 'Lấy chi tiết bài học thành công',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        console.error('Error in getLessonById:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết bài học',
            error: err.message
        });
        return;
    }
}

export async function checkLessonEnrollment(req: Request, res: Response): Promise<void> {
    const { lessonId, accountId } = req.params;

    if (!lessonId || !accountId) {
        res.status(400).json({ message: 'Thiếu thông tin bài học hoặc tài khoản' });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT * 
                FROM LessonProgress 
                WHERE LessonID = @LessonID AND AccountID = @AccountID
            `);

        if (result.recordset.length > 0) {
            res.status(200).json({
                message: 'Tài khoản đã đăng ký bài học này',
                data: { isEnrolled: true }
            });
        } else {
            res.status(200).json({
                message: 'Tài khoản chưa đăng ký bài học này',
                data: { isEnrolled: false }
            });
        }
        return;
    } catch (err: any) {
        console.error('Error in checkLessonEnrollment:', err);
        res.status(500).json({
            message: 'Lỗi khi kiểm tra đăng ký bài học',
            error: err.message
        });
        return;
    }
}

export async function lessonEnroll(req: Request, res: Response): Promise<void> {
    const { lessonId, accountId } = req.params;

    console.log('Lesson enrollment request:', req.params);

    if (!lessonId || !accountId) {
        res.status(400).json({ message: 'Thiếu thông tin bài học hoặc tài khoản' });
        return;
    }

    try {
        const pool = await poolPromise;

        // First, get the course ID for this lesson
        const lessonResult = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .query(`
                SELECT CourseID 
                FROM Lesson 
                WHERE LessonID = @LessonID AND IsDisabled = 0
            `);

        if (lessonResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }

        const courseId = lessonResult.recordset[0].CourseID;

        // Check if user is enrolled in the course
        const courseEnrollmentCheck = await pool.request()
            .input('AccountID', sql.Int, accountId)
            .input('CourseID', sql.Int, courseId)
            .query(`
                SELECT * 
                FROM Enrollment 
                WHERE AccountID = @AccountID AND CourseID = @CourseID
            `);

        if (courseEnrollmentCheck.recordset.length === 0) {
            res.status(400).json({ message: 'Tài khoản chưa đăng ký khóa học này' });
            return;
        }

        // Check if already enrolled in lesson
        const checkLessonEnrollment = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT * 
                FROM LessonProgress 
                WHERE LessonID = @LessonID AND AccountID = @AccountID
            `);

        if (checkLessonEnrollment.recordset.length > 0) {
            res.status(200).json({ message: 'Tài khoản đã đăng ký bài học này rồi' });
            return;
        }

        // Enroll in lesson
        const result = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                INSERT INTO LessonProgress (LessonID, AccountID, CompletionPercentage, IsCompleted)
                VALUES (@LessonID, @AccountID, 0, 0)
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(400).json({ message: 'Đăng ký bài học không thành công' });
            return;
        }

        res.status(201).json({ message: 'Đăng ký bài học thành công' });
        return;
    } catch (err: any) {
        console.error('Error in lessonEnroll:', err);
        res.status(500).json({
            message: 'Lỗi khi đăng ký bài học',
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
 * @route PUT /api/lessons/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID bài học trong params, dữ liệu cập nhật trong body
 * @param {Response} res - Kết quả trả về
 * @throws {400} Nếu dữ liệu đầu vào không hợp lệ
 * @throws {404} Nếu không tìm thấy bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLesson(req: Request, res: Response): Promise<void> {
    // Lấy lessonId từ params
    const lessonId = Number(req.params.id);
    if (isNaN(lessonId)) {
        res.status(400).json({ message: 'ID bài học không hợp lệ' });
        return;
    }

    // Lấy dữ liệu cập nhật từ body
    const { CourseID, Title, BriefDescription, Content, Duration, VideoUrl, Status } = req.body;

    if (!Title && !Content && !CourseID && !BriefDescription && Duration === undefined && !VideoUrl && !Status) {
        res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
        return;
    }

    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;

        // Kiểm tra bài học có tồn tại không
        const checkResult = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .query('SELECT LessonID FROM Lesson WHERE LessonID = @LessonID AND IsDisabled = 0');

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }

        // Tạo câu lệnh cập nhật động
        const updateFields: string[] = [];
        const request = pool.request();
        request.input('LessonID', sql.Int, lessonId);

        if (CourseID) {
            updateFields.push('CourseID = @CourseID');
            request.input('CourseID', sql.Int, CourseID);
        }
        if (Title) {
            updateFields.push('Title = @Title');
            request.input('Title', sql.NVarChar, Title);
        }
        if (BriefDescription !== undefined) {
            updateFields.push('BriefDescription = @BriefDescription');
            request.input('BriefDescription', sql.NVarChar, BriefDescription);
        }
        if (Content) {
            updateFields.push('Content = @Content');
            request.input('Content', sql.NVarChar(sql.MAX), Content);
        }
        if (Duration !== undefined) {
            updateFields.push('Duration = @Duration');
            request.input('Duration', sql.Int, Duration);
        }
        if (VideoUrl !== undefined) {
            updateFields.push('VideoUrl = @VideoUrl');
            request.input('VideoUrl', sql.NVarChar, VideoUrl);
        }
        if (Status) {
            updateFields.push('Status = @Status');
            request.input('Status', sql.NVarChar, Status);
        }

        // Thực thi truy vấn cập nhật
        const sqlUpdate = `
            UPDATE Lesson SET ${updateFields.join(', ')}
            WHERE LessonID = @LessonID;
            
            SELECT 
                LessonID, CourseID, Title, BriefDescription, Content, 
                Duration, VideoUrl, Status, IsDisabled
            FROM Lesson 
            WHERE LessonID = @LessonID
        `;

        const result = await request.query(sqlUpdate);

        // Trả về bài học đã cập nhật
        res.status(200).json({
            message: 'Cập nhật bài học thành công',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong updateLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật bài học',
            error: err.message
        });
        return;
    }
}

/**
 * Xoá bài học theo ID (soft delete)
 * 
 * @route DELETE /api/lessons/:id
 * @access Quản trị viên, Nhân viên
 * @param {Request} req - ID bài học trong params
 * @param {Response} res - Kết quả trả về
 * @throws {400} Nếu ID không hợp lệ
 * @throws {404} Nếu không tìm thấy bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function deleteLesson(req: Request, res: Response): Promise<void> {
    // Lấy lessonId từ params
    const lessonId = Number(req.params.id);
    if (isNaN(lessonId)) {
        res.status(400).json({ message: 'ID bài học không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;

        // Kiểm tra bài học có tồn tại không
        const checkResult = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .query('SELECT LessonID FROM Lesson WHERE LessonID = @LessonID AND IsDisabled = 0');

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài học' });
            return;
        }

        // Thực hiện soft delete (đánh dấu IsDisabled = 1)
        const result = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .query('UPDATE Lesson SET IsDisabled = 1 WHERE LessonID = @LessonID');

        // Trả về kết quả xoá thành công
        res.status(200).json({ message: 'Xoá bài học thành công' });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong deleteLesson:', err);
        res.status(500).json({ message: 'Lỗi khi xoá bài học', error: err.message });
        return;
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

/**
 * Lấy chi tiết một bài học cụ thể trong một khóa học
 * 
 * @route GET /api/course/:courseId/lessons/:lessonId
 * @access Công khai
 * @param {Request} req - Đối tượng request với courseId và lessonId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài học
 * @throws {400} Nếu ID không hợp lệ
 * @throws {404} Nếu không tìm thấy bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonProgressByCourseAndLessonId(req: Request, res: Response): Promise<void> {
    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);
    const accountId = Number(req.params.accountId);
    if (isNaN(courseId) || isNaN(lessonId)) {
        res.status(400).json({
            message: 'ID khóa học hoặc ID bài học không hợp lệ'
        });
        return;
    }

    console.log(req.params);

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('LessonId', sql.Int, lessonId)
            .input('AccountId', sql.Int, accountId)
            .query(`
                SELECT 
                    l.LessonID, 
                    l.CourseID, 
                    lp.AccountID,
                    l.Title, 
                    l.BriefDescription, 
                    l.Content, 
                    l.Duration, 
                    l.VideoUrl, 
                    l.Status, 
                    l.IsDisabled,
                    c.CourseName,
                    lp.CompletionPercentage,
                    lp.IsCompleted
                FROM Lesson l
                JOIN Course c ON l.CourseID = c.CourseID
                JOIN LessonProgress lp ON l.LessonID = lp.LessonID
                WHERE l.LessonID = @LessonId AND l.CourseID = @CourseId
                AND lp.AccountID = @AccountID AND l.IsDisabled = 0
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy tiến trình bài học trong khóa học này' });
            return;
        }

        res.status(200).json({
            message: 'Lấy chi tiết bài học thành công',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        console.error('Error in getLessonByCourseAndLessonId:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết bài học',
            error: err.message
        });
        return;
    }
}

/**
 * Cập nhật tiến độ hoàn thành bài học
 * 
 * @route PUT /api/course/:courseId/lessons/:lessonId/progress
 * @access Thành viên
 * @param {Request} req - Đối tượng request với courseId, lessonId trong params và progress data trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả cập nhật
 * @throws {400} Nếu dữ liệu không hợp lệ
 * @throws {404} Nếu không tìm thấy lesson progress
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLessonProgress(req: Request, res: Response): Promise<void> {
    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);
    const { accountId, completionPercentage, lastValidTime } = req.body;

    // Validate input parameters
    if (isNaN(courseId) || isNaN(lessonId)) {
        res.status(400).json({
            message: 'ID khóa học hoặc ID bài học không hợp lệ'
        });
        return;
    }

    if (!accountId || completionPercentage === undefined) {
        res.status(400).json({
            message: 'Thiếu thông tin tài khoản hoặc phần trăm hoàn thành'
        });
        return;
    }

    // Validate completion percentage (0-100)
    if (completionPercentage < 0 || completionPercentage > 100) {
        res.status(400).json({
            message: 'Phần trăm hoàn thành phải từ 0 đến 100'
        });
        return;
    }

    try {
        const pool = await poolPromise;

        // Check if lesson progress exists
        const checkProgress = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT CompletionPercentage, IsCompleted 
                FROM LessonProgress 
                WHERE LessonID = @LessonID AND AccountID = @AccountID
            `);

        if (checkProgress.recordset.length === 0) {
            // Create new lesson progress if it doesn't exist
            const createResult = await pool.request()
                .input('LessonID', sql.Int, lessonId)
                .input('AccountID', sql.Int, accountId)
                .input('CompletionPercentage', sql.Decimal(5, 2), completionPercentage)
                .input('LastValidTime', sql.Decimal(10, 2), lastValidTime || 0)
                .input('IsCompleted', sql.Bit, completionPercentage >= 100)
                .query(`
                    INSERT INTO LessonProgress (LessonID, AccountID, CompletionPercentage, LastValidTime, IsCompleted)
                    OUTPUT INSERTED.*
                    VALUES (@LessonID, @AccountID, @CompletionPercentage, @LastValidTime, @IsCompleted)
                `);

            res.status(201).json({
                message: 'Tạo tiến độ bài học thành công',
                data: createResult.recordset[0]
            });
            return;
        }

        // Update existing lesson progress
        const currentProgress = checkProgress.recordset[0];
        const newCompletionPercentage = Math.max(currentProgress.CompletionPercentage || 0, completionPercentage);
        const isCompleted = newCompletionPercentage >= 100;

        const updateResult = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .input('CompletionPercentage', sql.Decimal(5, 2), newCompletionPercentage)
            .input('LastValidTime', sql.Decimal(10, 2), lastValidTime || 0)
            .input('IsCompleted', sql.Bit, isCompleted)
            .input('LastUpdatedAt', sql.DateTime, new Date())
            .query(`
                UPDATE LessonProgress 
                SET 
                    CompletionPercentage = @CompletionPercentage,
                    LastValidTime = @LastValidTime,
                    IsCompleted = @IsCompleted,
                    LastUpdatedAt = @LastUpdatedAt
                WHERE LessonID = @LessonID AND AccountID = @AccountID;

                SELECT 
                    lp.LessonID,
                    lp.AccountID,
                    lp.CompletionPercentage,
                    lp.LastValidTime,
                    lp.IsCompleted,
                    lp.LastUpdatedAt,
                    l.Title as LessonTitle
                FROM LessonProgress lp
                JOIN Lesson l ON lp.LessonID = l.LessonID
                WHERE lp.LessonID = @LessonID AND lp.AccountID = @AccountID
            `);

        if (updateResult.recordset.length === 0) {
            res.status(404).json({
                message: 'Không thể cập nhật tiến độ bài học'
            });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật tiến độ bài học thành công',
            data: updateResult.recordset[0]
        });
        return;

    } catch (err: any) {
        console.error('Error in updateLessonProgress:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật tiến độ bài học',
            error: err.message
        });
        return;
    }
}

/**
 * Đánh dấu bài học là hoàn thành
 * 
 * @route POST /api/course/:courseId/lessons/:lessonId/complete
 * @access Thành viên
 * @param {Request} req - Đối tượng request với courseId, lessonId trong params và accountId trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả
 */
export async function markLessonCompleted(req: Request, res: Response): Promise<void> {
    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);
    const { accountId } = req.body;

    if (isNaN(courseId) || isNaN(lessonId)) {
        res.status(400).json({
            message: 'ID khóa học hoặc ID bài học không hợp lệ'
        });
        return;
    }

    if (!accountId) {
        res.status(400).json({
            message: 'Thiếu thông tin tài khoản'
        });
        return;
    }

    try {
        const pool = await poolPromise;

        // Update lesson progress to completed (100%)
        const result = await pool.request()
            .input('LessonID', sql.Int, lessonId)
            .input('AccountID', sql.Int, accountId)
            .input('CompletionPercentage', sql.Decimal(5, 2), 100)
            .input('IsCompleted', sql.Bit, true)
            .input('LastUpdatedAt', sql.DateTime, new Date())
            .query(`
                UPDATE LessonProgress 
                SET 
                    CompletionPercentage = @CompletionPercentage,
                    IsCompleted = @IsCompleted,
                    LastUpdatedAt = @LastUpdatedAt
                WHERE LessonID = @LessonID AND AccountID = @AccountID;

                SELECT 
                    lp.*,
                    l.Title as LessonTitle
                FROM LessonProgress lp
                JOIN Lesson l ON lp.LessonID = l.LessonID
                WHERE lp.LessonID = @LessonID AND lp.AccountID = @AccountID
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({
                message: 'Không tìm thấy tiến độ bài học để hoàn thành'
            });
            return;
        }

        res.status(200).json({
            message: 'Đánh dấu bài học hoàn thành thành công',
            data: result.recordset[0]
        });
        return;

    } catch (err: any) {
        console.error('Error in markLessonCompleted:', err);
        res.status(500).json({
            message: 'Lỗi khi đánh dấu bài học hoàn thành',
            error: err.message
        });
        return;
    }
}