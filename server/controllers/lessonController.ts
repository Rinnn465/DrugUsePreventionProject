import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import e, { Request, Response } from 'express';

dotenv.config();

/**
 * Lấy tất cả bài học cho một khóa học cụ thể
 * 
 * @route GET /api/lessons/course/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLesson(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Lấy bài học cho khóa học ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Truy vấn bài học với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('CourseId', Number(courseId))
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId');
        res.status(200).json({
            message: 'Lấy khóa học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong getLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy nội dung bài học bao gồm câu hỏi cho một khóa học cụ thể
 * 
 * @route GET /api/lessons/content/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với nội dung bài học và câu hỏi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonContent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        // Truy vấn phức tạp kết hợp bài học và câu hỏi
        const result = await pool.request()
            .input('CourseId', Number(id))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);
        res.status(200).json({
            message: 'Lấy nội dung bài học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Lỗi trong getLessonContent:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy nội dung bài học',
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
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách câu hỏi của bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Lấy câu hỏi cho bài học ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Truy vấn câu hỏi cho bài học cụ thể
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);

        res.status(200).json({
            message: 'Lấy câu hỏi bài học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getQuestions:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy câu hỏi bài học',
            error: err.message
        });
    }
}

/**
 * Lấy tất cả đáp án cho các câu hỏi trong một khóa học cụ thể
 * 
 * @route GET /api/lessons/answers/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách đáp án
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getAnswers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`Lấy đáp án cho câu hỏi ID: ${id}`);

    try {
        const pool = await poolPromise;
        // Truy vấn phức tạp để lấy đáp án cho tất cả câu hỏi trong một khóa học
        const result = await pool.request()
            .input('CourseID', id)
            .query(`
            SELECT * 
            FROM LessonAnswer 
            WHERE QuestionID IN (
                SELECT lq.QuestionID 
                FROM Lesson l
                JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                WHERE l.CourseID = @CourseID
            );`);

        res.status(200).json({
            message: 'Lấy đáp án bài học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getAnswers:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy đáp án bài học',
            error: err.message
        });
    }
}

/**
 * Lấy tất cả bài học cho một khóa học, bao gồm câu hỏi và đáp án
 * 
 * @route GET /api/lessons/course/:id/details
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với bài học, câu hỏi và đáp án
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonDetails(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Lấy chi tiết bài học cho khóa học ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Truy vấn phức tạp để lấy bài học với câu hỏi và đáp án
        const result = await pool.request()
            .input('CourseID', Number(courseId))
            .query(`
                SELECT l.LessonID, l.Title, l.Content, l.Order, l.Duration, l.IsActive,
                       lq.QuestionID, lq.QuestionText, lq.QuestionType, lq.Points,
                       la.AnswerID, la.AnswerText
                FROM Lesson l
                LEFT JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                LEFT JOIN LessonAnswer la ON lq.QuestionID = la.QuestionID
                WHERE l.CourseID = @CourseID
            `);

        res.status(200).json({
            message: 'Lấy chi tiết bài học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getLessonDetails:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết bài học',
            error: err.message
        });
    }
}

/**
 * Lấy một bài học cụ thể theo ID của nó
 * 
 * @route GET /api/lessons/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài học
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonById(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Lấy bài học với ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Truy vấn bài học cụ thể với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query('SELECT * FROM Lesson WHERE LessonID = @LessonID');

        // Kiểm tra xem bài học có tồn tại hay không
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Lấy bài học thành công',
            data: result.recordset[0]
        });
    } catch (err: any) {
        console.error('Lỗi trong getLessonById:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy bài học',
            error: err.message
        });
    }
}

/**
 * Tạo một bài học mới cho một khóa học cụ thể
 * @route POST /api/lessons
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu bài học trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài học vừa tạo
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 * */
export async function createLesson(req: Request, res: Response): Promise<void> {
    const { CourseID, Title, Content, Order, Duration, IsActive } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!CourseID || !Title || !Content || Order === undefined || Duration === undefined) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Chèn bài học mới với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('CourseID', Number(CourseID))
            .input('Title', Title)
            .input('Content', Content)
            .input('Order', Number(Order))
            .input('Duration', Number(Duration))
            .input('IsActive', Boolean(IsActive))
            .query(`
                INSERT INTO Lesson (CourseID, Title, Content, [Order], Duration, IsActive)
                VALUES (@CourseID, @Title, @Content, @Order, @Duration, @IsActive);
                SELECT SCOPE_IDENTITY() AS LessonID;
            `);

        const newLessonId = result.recordset[0].LessonID;
        res.status(201).json({
            message: 'Tạo bài học thành công',
            data: { LessonID: newLessonId }
        });
    } catch (err: any) {
        console.error('Lỗi trong createLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi tạo bài học',
            error: err.message
        });
    }
}

/**
 * Cập nhật một bài học hiện có theo ID của nó
 * 
 * @route PUT /api/lessons/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài học đã được cập nhật
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    const { CourseID, Title, Content, Order, Duration, IsActive } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!CourseID || !Title || !Content || Order === undefined || Duration === undefined) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Cập nhật bài học với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .input('CourseID', Number(CourseID))
            .input('Title', Title)
            .input('Content', Content)
            .input('Order', Number(Order))
            .input('Duration', Number(Duration))
            .input('IsActive', Boolean(IsActive))
            .query(`
                UPDATE Lesson 
                SET CourseID = @CourseID, Title = @Title, Content = @Content, 
                    [Order] = @Order, Duration = @Duration, IsActive = @IsActive
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật bài học thành công',
            data: { LessonID: lessonId }
        });
    } catch (err: any) {
        console.error('Lỗi trong updateLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật bài học',
            error: err.message
        });
    }
}

/**
 * Xóa một bài học theo ID của nó
 * 
 * @route DELETE /api/lessons/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận việc xóa
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function deleteLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Xóa bài học với ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Xóa bài học với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query('DELETE FROM Lesson WHERE LessonID = @LessonID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Xóa bài học thành công'
        });
    } catch (err: any) {
        console.error('Lỗi trong deleteLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi xóa bài học',
            error: err.message
        });
    }
}


/**
 * Cập nhật nội dung của một bài học theo ID của nó
 * 
 * @route PUT /api/lessons/content/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params và nội dung cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với nội dung bài học đã được cập nhật
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLessonContent(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    const { Content } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!Content) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Cập nhật nội dung bài học với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .input('Content', Content)
            .query(`
                UPDATE Lesson 
                SET Content = @Content
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật nội dung bài học thành công',
            data: { LessonID: lessonId }
        });
    } catch (err: any) {
        console.error('Lỗi trong updateLessonContent:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật nội dung bài học',
            error: err.message
        });
    }
}


/**
 * Tạo mới một câu hỏi cho một bài học
 * @route POST /api/lessons/questions
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu câu hỏi trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết câu hỏi vừa tạo
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function createLessonQuestion(req: Request, res: Response): Promise<void> {
    const { LessonID, QuestionText, QuestionType, Points } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!LessonID || !QuestionText || !QuestionType || Points === undefined) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Chèn câu hỏi mới với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('LessonID', Number(LessonID))
            .input('QuestionText', QuestionText)
            .input('QuestionType', QuestionType)
            .input('Points', Number(Points))
            .query(`
                INSERT INTO LessonQuestion (LessonID, QuestionText, QuestionType, Points)
                VALUES (@LessonID, @QuestionText, @QuestionType, @Points);
                SELECT SCOPE_IDENTITY() AS QuestionID;
            `);

        const newQuestionId = result.recordset[0].QuestionID;
        res.status(201).json({
            message: 'Tạo câu hỏi bài học thành công',
            data: { QuestionID: newQuestionId }
        });
    } catch (err: any) {
        console.error('Lỗi trong createLessonQuestion:', err);
        res.status(500).json({
            message: 'Lỗi khi tạo câu hỏi bài học',
            error: err.message
        });
    }
}

/**
 * Cập nhật một câu hỏi bài học theo ID
 * 
 * @route PUT /api/lessons/questions/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID câu hỏi trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết câu hỏi đã được cập nhật
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {404} Nếu câu hỏi không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLessonQuestion(req: Request, res: Response): Promise<void> {
    const questionId = req.params.id;
    const { LessonID, QuestionText, QuestionType, Points } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!LessonID || !QuestionText || !QuestionType || Points === undefined) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Cập nhật câu hỏi với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('QuestionID', Number(questionId))
            .input('LessonID', Number(LessonID))
            .input('QuestionText', QuestionText)
            .input('QuestionType', QuestionType)
            .input('Points', Number(Points))
            .query(`
                UPDATE LessonQuestion 
                SET LessonID = @LessonID, QuestionText = @QuestionText, 
                    QuestionType = @QuestionType, Points = @Points
                WHERE QuestionID = @QuestionID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Câu hỏi bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật câu hỏi bài học thành công',
            data: { QuestionID: questionId }
        });
    } catch (err: any) {
        console.error('Lỗi trong updateLessonQuestion:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật câu hỏi bài học',
            error: err.message
        });
    }
}

/**
 * Xóa một câu hỏi bài học theo ID
 * 
 * @route DELETE /api/lessons/questions/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID câu hỏi trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận việc xóa
 * @throws {404} Nếu câu hỏi không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function deleteLessonQuestion(req: Request, res: Response): Promise<void> {
    const questionId = req.params.id;
    console.log(`Deleting lesson question with ID: ${questionId}`);

    try {
        const pool = await poolPromise;
        // Xóa câu hỏi với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('QuestionID', Number(questionId))
            .query('DELETE FROM LessonQuestion WHERE QuestionID = @QuestionID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Câu hỏi bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Xóa câu hỏi bài học thành công'
        });
    } catch (err: any) {
        console.error('Lỗi trong deleteLessonQuestion:', err);
        res.status(500).json({
            message: 'Lỗi khi xóa câu hỏi bài học',
            error: err.message
        });
    }
}


/**Creates a new answer for a specific lesson question   
 * @route POST /api/lessons/answers
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu đáp án trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết đáp án vừa tạo
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 * */
export async function createLessonAnswer(req: Request, res: Response): Promise<void> {
    const { QuestionID, AnswerText } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!QuestionID || !AnswerText) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Chèn đáp án mới với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('QuestionID', Number(QuestionID))
            .input('AnswerText', AnswerText)
            .query(`
                INSERT INTO LessonAnswer (QuestionID, AnswerText)
                VALUES (@QuestionID, @AnswerText);
                SELECT SCOPE_IDENTITY() AS AnswerID;
            `);

        const newAnswerId = result.recordset[0].AnswerID;
        res.status(201).json({
            message: 'Tạo đáp án bài học thành công',
            data: { AnswerID: newAnswerId }
        });
    } catch (err: any) {
        console.error('Lỗi trong createLessonAnswer:', err);
        res.status(500).json({
            message: 'Lỗi khi tạo đáp án bài học',
            error: err.message
        });
    }
}

/**
 * Cập nhật một đáp án bài học theo ID
 * 
 * @route PUT /api/lessons/answers/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID đáp án trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết đáp án đã được cập nhật
 * @throws {400} Nếu thiếu trường bắt buộc
 * @throws {404} Nếu đáp án không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function updateLessonAnswer(req: Request, res: Response): Promise<void> {
    const answerId = req.params.id;
    const { QuestionID, AnswerText } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!QuestionID || !AnswerText) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Cập nhật đáp án với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('AnswerID', Number(answerId))
            .input('QuestionID', Number(QuestionID))
            .input('AnswerText', AnswerText)
            .query(`
                UPDATE LessonAnswer 
                SET QuestionID = @QuestionID, AnswerText = @AnswerText
                WHERE AnswerID = @AnswerID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Đáp án bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật đáp án bài học thành công',
            data: { AnswerID: answerId }
        });
    } catch (err: any) {
        console.error('Lỗi trong updateLessonAnswer:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật đáp án bài học',
            error: err.message
        });
    }
}

/**
 * Xóa một đáp án bài học theo ID
 * 
 * @route DELETE /api/lessons/answers/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID đáp án trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận việc xóa
 * @throws {404} Nếu đáp án không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function deleteLessonAnswer(req: Request, res: Response): Promise<void> {
    const answerId = req.params.id;
    console.log(`Deleting lesson answer with ID: ${answerId}`);

    try {
        const pool = await poolPromise;
        // Xóa đáp án với truy vấn có tham số để bảo mật
        const result = await pool.request()
            .input('AnswerID', Number(answerId))
            .query('DELETE FROM LessonAnswer WHERE AnswerID = @AnswerID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Đáp án bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Xóa đáp án bài học thành công'
        });
    } catch (err: any) {
        console.error('Lỗi trong deleteLessonAnswer:', err);
        res.status(500).json({
            message: 'Lỗi khi xóa đáp án bài học',
            error: err.message
        });
    }
}

/**
 * Vô hiệu hóa một bài học theo ID
 * 
 * @route PUT /api/lessons/deactivate/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận việc vô hiệu hóa
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function deactivateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Vô hiệu hóa bài học với ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Cập nhật bài học để đặt IsActive thành false
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                UPDATE Lesson 
                SET IsActive = 0
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Bài học đã được vô hiệu hóa'
        });
    } catch (err: any) {
        console.error('Lỗi trong deactivateLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi vô hiệu hóa bài học',
            error: err.message
        });
    }
}

/**
 * Kích hoạt một bài học theo ID
 * 
 * @route PUT /api/lessons/activate/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID bài học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận việc kích hoạt
 * @throws {404} Nếu bài học không tồn tại
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function activateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Kích hoạt bài học với ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Cập nhật bài học để đặt IsActive thành true
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                UPDATE Lesson 
                SET IsActive = 1
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Bài học không tồn tại" });
            return;
        }

        res.status(200).json({
            message: 'Bài học đã được kích hoạt'
        });
    } catch (err: any) {
        console.error('Lỗi trong activateLesson:', err);
        res.status(500).json({
            message: 'Lỗi khi kích hoạt bài học',
            error: err.message
        });
    }
}

/**
 * Lấy tất cả bài học đã vô hiệu hóa
 * 
 * @route GET /api/lessons/deactivated
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách bài học đã vô hiệu hóa
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getDeactivatedLessons(req: Request, res: Response): Promise<void> {
    console.log('Lấy tất cả bài học đã vô hiệu hóa');

    try {
        const pool = await poolPromise;
        // Truy vấn để lấy tất cả bài học đã vô hiệu hóa
        const result = await pool.request()
            .query('SELECT * FROM Lesson WHERE IsActive = 0');

        res.status(200).json({
            message: 'Lấy bài học đã vô hiệu hóa thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getDeactivatedLessons:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy bài học đã vô hiệu hóa',
            error: err.message
        });
    }
}

/**
 * Lấy tất cả bài học đã kích hoạt
 * 
 * @route GET /api/lessons/activated
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách bài học đã kích hoạt
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getActivatedLessons(req: Request, res: Response): Promise<void> {
    console.log('Lấy tất cả bài học đã kích hoạt');

    try {
        const pool = await poolPromise;
        // Truy vấn để lấy tất cả bài học đã kích hoạt
        const result = await pool.request()
            .query('SELECT * FROM Lesson WHERE IsActive = 1');

        res.status(200).json({
            message: 'Lấy bài học đã kích hoạt thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getActivatedLessons:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy bài học đã kích hoạt',
            error: err.message
        });
    }
}

/**
 * Lấy tất cả bài học cho một khóa học cụ thể
 * 
 * @route GET /api/lessons/course/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng bài học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getLessonsByCourseId(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Lấy tất cả bài học cho khóa học ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Truy vấn để lấy tất cả bài học cho khóa học cụ thể
        const result = await pool.request()
            .input('CourseID', Number(courseId))
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseID');

        res.status(200).json({
            message: 'Lấy tất cả bài học cho khóa học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Lỗi trong getLessonsByCourseId:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy tất cả bài học cho khóa học',
            error: err.message
        });
    }
}
