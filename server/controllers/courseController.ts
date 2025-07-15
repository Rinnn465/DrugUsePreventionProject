import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import { Request, Response } from 'express';
import { sendEmail } from './mailController';
import { courseCompletionTemplate } from '../templates/courseCompletion';

dotenv.config();
/**
 * Lấy tất cả các khóa học đang hoạt động từ cơ sở dữ liệu
 *
 * @route GET /api/courses
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng các khóa học
 * @throws {400} Nếu tham số request không hợp lệ
 * @throws {404} Nếu không tìm thấy khóa học nào
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourses(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới pool của database

        // Sử dụng truy vấn SQL để lấy danh sách khóa học và gom nhóm category dạng JSON
        const result = await pool.request().query(`
            SELECT 
                c.CourseID, 
                c.CourseName, 
                c.Risk, 
                c.Description, 
                c.ImageUrl, 
                c.EnrollCount,
                c.Duration,
                c.IsDisabled,
                c.Status,
                (
                    SELECT cc.CategoryID, cate.CategoryName
                    FROM CourseCategory cc
                    JOIN Category cate ON cate.CategoryID = cc.CategoryID
                    WHERE cc.CourseID = c.CourseID
                    FOR JSON PATH
                ) AS CategoryJSON
            FROM Course c
            WHERE c.IsDisabled = 0
        `);

        // Xử lý parse CategoryJSON thành mảng object
        const courses = result.recordset.map(course => {
            let categories = [];
            if (course.CategoryJSON) {
                try {
                    categories = JSON.parse(course.CategoryJSON); // Parse chuỗi JSON sang mảng
                } catch (parseError) {
                    console.error('Lỗi parse CategoryJSON cho course', course.CourseID, ':', parseError);
                    categories = [];
                }
            }
            // Trả về object course với category đã parse
            return {
                CourseID: course.CourseID,
                CourseName: course.CourseName,
                Risk: course.Risk,
                Description: course.Description,
                ImageUrl: course.ImageUrl,
                EnrollCount: course.EnrollCount,
                Duration: course.Duration,
                IsDisabled: course.IsDisabled,
                Status: course.Status,
                Category: categories
            };
        });

        // Trả về kết quả thành công
        res.status(200).json({
            message: 'Lấy danh sách khóa học thành công',
            data: courses
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCourses:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy tất cả các danh mục khóa học từ cơ sở dữ liệu
 *
 * @route GET /api/courses/category
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng danh mục khóa học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourseCategories(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy tất cả danh mục khóa học
        const result = await pool.request().query('SELECT * FROM Category');
        // Trả về kết quả thành công
        res.status(200).json({
            message: 'Lấy danh mục khóa học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCourseCategories:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh mục khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy chi tiết một khóa học theo ID
 *
 * @route GET /api/courses/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin chi tiết khóa học
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourseById(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params và ép kiểu sang số
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'courseId không hợp lệ' });
        return;
    }
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy khóa học theo ID, dùng parameter để tránh SQL injection
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Course WHERE CourseID = @courseId');
        // Kiểm tra nếu không tìm thấy khóa học
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }
        // Trả về dữ liệu khóa học
        res.status(200).json({
            message: 'Lấy thông tin khóa học thành công',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCourseById:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Đăng ký khóa học cho người dùng
 *
 * @route POST /api/course/:id/enroll
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa thông tin đăng ký trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin đăng ký
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function enrollCourse(req: Request, res: Response): Promise<void> {
    const { courseId, accountId, enrollmentDate, status } = req.body; // Lấy thông tin đăng ký từ body
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Thực hiện truy vấn thêm mới bản ghi đăng ký khóa học
        await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .input('EnrollmentDate', sql.DateTime, enrollmentDate)
            .input('Status', sql.VarChar(50), status)
            .query('INSERT INTO Enrollment (CourseID, AccountID, EnrollmentDate, Status) VALUES (@CourseId, @AccountId, @EnrollmentDate, @Status)');
        // Trả về kết quả đăng ký thành công
        res.status(201).json({ message: 'Đăng ký khóa học thành công', data: { courseId, accountId, enrollmentDate, status } });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong enrollCourse:', err);
        res.status(500).json({ message: 'Lỗi trong quá trình đăng ký', error: err.message });
        return;
    }
}

/**
 * Lấy tất cả các khóa học mà người dùng đã đăng ký
 *
 * @route GET /api/courses/enrolled
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách khóa học đã đăng ký
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getEnrolledCourses(req: Request, res: Response): Promise<void> {
    const accountId = req.params.id; // Lấy accountId từ params
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy tất cả các khóa học mà user đã đăng ký
        const result = await pool.request()
            .input('AccountId', sql.Int, accountId)
            .query(
                `SELECT e.EnrollmentID, e.CourseID, e.AccountID, e.CompletedDate, e.Status, c.CourseName, c.Description, c.ImageUrl, c.IsDisabled 
                FROM Enrollment e JOIN Course c ON e.CourseID = c.CourseID
                WHERE AccountID = @AccountID AND c.IsDisabled = 0
                `
            );
        // Trả về danh sách khóa học đã đăng ký
        res.status(200).json({
            message: 'Lấy danh sách khóa học đã đăng ký thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getEnrolledCourses:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách khóa học đã đăng ký',
            error: err.message
        });
        return;
    }
}

/**
 * Đánh dấu hoàn thành khóa học cho người dùng và gửi email chúc mừng
 *
 * @route PATCH /api/course/:id/complete
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params và account ID trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với trạng thái hoàn thành
 * @throws {404} Nếu không tìm thấy bản ghi đăng ký
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function completeCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id; // Lấy courseId từ params
    const { accountId } = req.body; // Lấy accountId từ body
    const completedDate = new Date().toISOString(); // Ngày hoàn thành hiện tại
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Kiểm tra enrollment tồn tại và lấy thông tin user + course
        const checkResult = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .query(`
                SELECT e.*, c.CourseName, a.FullName, a.Email 
                FROM Enrollment e 
                JOIN Course c ON e.CourseID = c.CourseID 
                JOIN Account a ON e.AccountID = a.AccountID
                WHERE e.CourseID = @CourseId AND e.AccountID = @AccountId
            `);
        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bản ghi đăng ký' });
            return;
        }
        const enrollment = checkResult.recordset[0];
        // Kiểm tra nếu đã hoàn thành
        if (enrollment.Status === 'Completed') {
            res.status(200).json({
                message: 'Khóa học đã được hoàn thành trước đó',
                data: {
                    courseId,
                    accountId,
                    completedDate: enrollment.CompletedDate,
                    status: 'Completed'
                }
            });
            return;
        }
        // Cập nhật trạng thái hoàn thành
        await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .input('CompletedDate', sql.DateTime, completedDate)
            .query(`
                UPDATE Enrollment 
                SET Status = 'Completed', CompletedDate = @CompletedDate
                WHERE CourseID = @CourseId AND AccountID = @AccountId
            `);
        // Gửi email chúc mừng
        try {
            const formattedDate = new Date(completedDate).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const emailHtml = courseCompletionTemplate(
                enrollment.FullName || 'Học viên',
                enrollment.CourseName,
                formattedDate
            );
            await sendEmail(
                enrollment.Email,
                `🎉 Chúc mừng bạn đã hoàn thành khóa học "${enrollment.CourseName}"!`,
                emailHtml
            );
        } catch (emailError) {
            console.error('Gửi email chúc mừng thất bại:', emailError);
            // Vẫn tiếp tục trả về kết quả dù gửi email lỗi
        }
        // Trả về kết quả hoàn thành thành công
        res.status(200).json({
            message: 'Hoàn thành khóa học thành công',
            data: {
                courseId,
                accountId,
                completedDate,
                status: 'Completed',
                courseName: enrollment.CourseName
            }
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong completeCourse:', err);
        res.status(500).json({
            message: 'Có lỗi trong quá trình xử lý',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy thông tin hoàn thành khóa học của người dùng
 *
 * @route GET /api/courses/:courseId/completed/:accountId
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa courseId và accountId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin hoàn thành khóa học
 * @throws {404} Nếu không tìm thấy bản ghi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCompletedCourseById(req: Request, res: Response): Promise<void> {
    const { courseId, accountId } = req.params; // Lấy courseId và accountId từ params
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy thông tin hoàn thành khóa học
        const result = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .query('SELECT * FROM Enrollment WHERE CourseID = @CourseId AND AccountID = @AccountId AND Status = \'Completed\'');

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy bản ghi hoàn thành' });
            return;
        }
        // Trả về thông tin hoàn thành
        res.status(200).json({
            message: 'Lấy thông tin hoàn thành khóa học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCompletedCourseById:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin hoàn thành khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Hủy đăng ký khóa học cho người dùng
 *
 * @route DELETE /api/courses/:id/unenroll
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params và account ID trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với trạng thái hủy đăng ký
 * @throws {404} Nếu không tìm thấy bản ghi đăng ký
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function unenrollCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id; // Lấy courseId từ params
    const { accountId } = req.body; // Lấy accountId từ body
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Kiểm tra user đã đăng ký khóa học chưa
        const checkEnrollment = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT EnrollmentID, Status 
                FROM Enrollment 
                WHERE CourseID = @CourseID AND AccountID = @AccountID
            `);
        if (checkEnrollment.recordset.length === 0) {
            res.status(404).json({ 
                success: false, 
                message: 'Bạn chưa đăng ký khóa học này' 
            });
            return;
        }
        const enrollment = checkEnrollment.recordset[0];
        // Kiểm tra nếu đã hoàn thành khóa học
        if (enrollment.Status === 'Completed') {
            res.status(400).json({ 
                success: false, 
                message: 'Không thể hủy đăng ký khóa học đã hoàn thành' 
            });
            return;
        }
        // Xóa bản ghi đăng ký
        await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                DELETE FROM Enrollment 
                WHERE CourseID = @CourseID AND AccountID = @AccountID
            `);
        // Cập nhật lại số lượng đăng ký của khóa học
        await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query(`
                UPDATE Course 
                SET EnrollCount = EnrollCount - 1 
                WHERE CourseID = @CourseID AND EnrollCount > 0
            `);
        // Trả về kết quả hủy đăng ký thành công
        res.status(200).json({ 
            success: true, 
            message: 'Hủy đăng ký khóa học thành công' 
        });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong unenrollCourse:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi hủy đăng ký khóa học', 
            error: err.message 
        });
    }
}

/**
 * Tạo mới một khóa học
 * 
 * @route POST /api/course
 * @access Quản trị viên
 * @param {Request} req - Dữ liệu khóa học trong body
 * @param {Response} res - Kết quả trả về
 */
export async function createCourse(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu khóa học từ body
    const { CourseName, Risk, Audience, Duration, Description, EnrollCount, ImageUrl, Status, IsDisabled } = req.body;
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thêm khóa học mới vào bảng Course
        const result = await pool.request()
            .input('CourseName', sql.NVarChar, CourseName)
            .input('Risk', sql.NVarChar, Risk)
            .input('Duration', sql.Int, Duration)
            .input('Description', sql.NVarChar, Description)
            .input('EnrollCount', sql.Int, EnrollCount)
            .input('ImageUrl', sql.NVarChar, ImageUrl)
            .input('Status', sql.NVarChar, Status)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`INSERT INTO Course (CourseName, Risk, Duration, Description, EnrollCount, ImageUrl, Status, IsDisabled)
                    OUTPUT INSERTED.*
                    VALUES (@CourseName, @Risk, @Duration, @Description, @EnrollCount, @ImageUrl, @Status, @IsDisabled)`); // Truy vấn thêm mới khóa học
        // Trả về khóa học vừa tạo
        res.status(201).json({ message: 'Tạo khóa học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi tạo khóa học', error: err.message });
    }
}

/**
 * Cập nhật thông tin khóa học theo ID
 * 
 * @route PUT /api/course/:id
 * @access Quản trị viên
 * @param {Request} req - ID khóa học trong params, dữ liệu cập nhật trong body
 * @param {Response} res - Kết quả trả về
 */
export async function updateCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'courseId không hợp lệ' });
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
    const params: any = { CourseID: courseId };
    Object.entries(fields).forEach(([key, value]) => {
        updates.push(`${key} = @${key}`);
        params[key] = value;
    });
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Tạo câu lệnh SQL cập nhật động
        const sqlUpdate = `
            UPDATE Course SET ${updates.join(', ')}
            WHERE CourseID = @CourseID;
            SELECT * FROM Course WHERE CourseID = @CourseID
        `;
        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });
        // Thực thi truy vấn cập nhật
        const result = await request.query(sqlUpdate);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }
        // Trả về khóa học đã cập nhật
        res.status(200).json({ message: 'Cập nhật khóa học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi cập nhật khóa học', error: err.message });
    }
}

/**
 * Xoá khóa học theo ID
 * 
 * @route DELETE /api/course/:id
 * @access Quản trị viên
 * @param {Request} req - ID khóa học trong params
 * @param {Response} res - Kết quả trả về
 */
export async function deleteCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'courseId không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới pool của database
        const pool = await poolPromise;
        // Thực hiện truy vấn xoá khóa học theo CourseID
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query('DELETE FROM Course WHERE CourseID = @CourseID');
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }
        // Trả về kết quả xoá thành công
        res.status(200).json({ message: 'Xoá khóa học thành công' });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        res.status(500).json({ message: 'Lỗi khi xoá khóa học', error: err.message });
    }
}

/**
 * Thống kê số người tham gia từng khóa học
 *
 * @route GET /api/course/statistics/enroll
 * @access Chỉ Admin
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách khóa học và số người tham gia
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourseEnrollmentStatistics(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy số lượng người đăng ký từng khóa học
        const result = await pool.request().query(`
            SELECT 
                c.CourseID,
                c.CourseName,
                COUNT(e.EnrollmentID) AS EnrollCount
            FROM Course c
            LEFT JOIN Enrollment e ON c.CourseID = e.CourseID
            GROUP BY c.CourseID, c.CourseName
            ORDER BY EnrollCount DESC
        `);
        // Trả về kết quả thống kê
        res.status(200).json({
            message: 'Thống kê số người tham gia từng khóa học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCourseEnrollmentStatistics:', err);
        res.status(500).json({
            message: 'Lỗi khi thống kê số người tham gia khóa học',
            error: err.message
        });
    }
}

/**
 * Thống kê tỷ lệ số người hoàn thành trên tổng số người tham gia từng khóa học
 *
 * @route GET /api/course/statistics/completion-rate
 * @access Chỉ Admin
 * @returns {Promise<void>} Phản hồi JSON với danh sách khóa học, số người tham gia, số người hoàn thành và tỷ lệ hoàn thành
 */
export async function getCourseCompletionRateStatistics(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy số lượng người đăng ký và số lượng người hoàn thành từng khóa học
        const result = await pool.request().query(`
            SELECT 
                c.CourseID,
                c.CourseName,
                COUNT(e.EnrollmentID) AS TotalEnroll,
                SUM(CASE WHEN e.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
                CASE WHEN COUNT(e.EnrollmentID) = 0 THEN 0 
                     ELSE CAST(SUM(CASE WHEN e.Status = 'Completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(e.EnrollmentID) END AS CompletionRate
            FROM Course c
            LEFT JOIN Enrollment e ON c.CourseID = e.CourseID
            GROUP BY c.CourseID, c.CourseName
            ORDER BY CompletionRate DESC
        `);
        // Trả về kết quả thống kê
        res.status(200).json({
            message: 'Thống kê tỷ lệ hoàn thành khóa học thành công',
            data: result.recordset
        });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getCourseCompletionRateStatistics:', err);
        res.status(500).json({
            message: 'Lỗi khi thống kê tỷ lệ hoàn thành khóa học',
            error: err.message
        });
    }
}