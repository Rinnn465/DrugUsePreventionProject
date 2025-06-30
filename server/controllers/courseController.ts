import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import { Request, Response } from 'express';

interface Course {
    CourseID: number;
    CourseName: string;
    Description: string;
    ImageUrl?: string | null;
    IsDisabled: boolean;    
}

dotenv.config();


/**
 * Lấy tất cả khoá học đang hoạt động từ database
 * Lấy tất cả các khóa học đang hoạt động từ cơ sở dữ liệu
 * 
 * @route GET /api/course
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa danh sách khoá học
 * @throws {500} Nếu có lỗi truy vấn database
 * @route GET /api/courses
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng các khóa học
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getCourses(req: Request, res: Response): Promise<void> {
    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Truy vấn tất cả các khóa học
        const result = await pool.request().query('SELECT * FROM Course');
        res.status(200).json({
            message: 'Lấy danh sách khoá học thành công',
            data: courses
        });
        return;
    } catch (err: any) {
        console.error('Lỗi khi lấy danh sách khoá học:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách khoá học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy tất cả danh mục khoá học
 * 
 * @route GET /api/course/category
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa danh mục khoá học
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function getCourseCategories(req: Request, res: Response): Promise<void> {
    try {
        // Lấy kết nối database
        const pool = await poolPromise;
        // Truy vấn tất cả danh mục khoá học
        const result = await pool.request().query('SELECT * FROM Category');
        res.status(200).json({
            message: 'Lấy danh mục khoá học thành công',
            message: 'Lấy danh sách khóa học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi lấy danh mục khoá học:', err);
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi trong getCourses:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh mục khoá học',
            message: 'Lỗi khi lấy danh sách khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy thông tin khoá học theo ID
 * Lấy thông tin chi tiết của một khóa học theo ID
 * 
 * @route GET /api/course/:id
 * @access Public
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa thông tin khoá học
 * @throws {404} Nếu không tìm thấy khoá học
 * @throws {500} Nếu có lỗi truy vấn database
 * @route GET /api/courses/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin khóa học
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi server
 */
export async function getCourseById(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        // Lấy kết nối tới database
        // Kết nối tới database
        const pool = await poolPromise;
        // Truy vấn khoá học cụ thể với tham số hoá để đảm bảo an toàn
        // Truy vấn khóa học cụ thể với truy vấn tham số hóa để đảm bảo an toàn
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Course WHERE CourseID = @courseId');

        // Kiểm tra nếu không tìm thấy khoá học
        // Kiểm tra nếu không tìm thấy khóa học
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy khoá học' });
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }

        // Trả về dữ liệu khoá học
        // Trả về dữ liệu khóa học
        res.status(200).json({
            message: 'Lấy khoá học thành công',
            message: 'Lấy thông tin khóa học thành công',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi lấy khoá học:', err);
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi lấy thông tin khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy khoá học',
            message: 'Lỗi khi lấy thông tin khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Đăng ký khoá học cho user
 * 
 * @route POST /api/course/:id/enroll
 * @access Private
 * @param {Request} req - Đối tượng request của Express, chứa thông tin đăng ký trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON thông báo đăng ký thành công
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function enrollCourse(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu từ body của request
    const { courseId, accountId, enrollmentDate, status } = req.body;

    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Thực hiện truy vấn thêm bản ghi vào bảng Enrollment với các tham số đã được truyền vào
        await pool.request()
            .input('CourseId', sql.Int, courseId) // Đảm bảo truyền đúng kiểu dữ liệu cho CourseId
            .input('AccountId', sql.Int, accountId) // Đảm bảo truyền đúng kiểu dữ liệu cho AccountId
            .input('EnrollmentDate', sql.DateTime, enrollmentDate) // Ngày đăng ký khoá học
            .input('Status', sql.VarChar(50), status) // Trạng thái đăng ký (ví dụ: Enrolled)
            .query('INSERT INTO Enrollment (CourseID, AccountID, EnrollmentDate, Status) VALUES (@CourseId, @AccountId, @EnrollmentDate, @Status)');

        // Trả về kết quả thành công cho client
        res.status(201).json({ message: 'Enrollment successful', data: { courseId, accountId, enrollmentDate, status } });
        return;
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        console.error('Error in enrollCourse:', err);
        res.status(500).json({ message: 'Cõ lối trong quá trình xử lý', error: err.message });
/** 
 * Tạo mới một khóa học trong cơ sở dữ liệu
 * @route POST /api/courses
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu khóa học trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin khóa học vừa tạo
 * @throws {400} Nếu dữ liệu khóa học không hợp lệ
 * @throws {500} Nếu có lỗi server
 * */
export async function createCourse(req: Request, res: Response): Promise<void> {
    const { CourseName, Description, ImageUrl, IsDisabled } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!CourseName || !Description) {
        res.status(400).json({ message: 'Tên và mô tả khóa học là bắt buộc' });
        return;
    }
}

/**
 * Lấy tất cả khoá học mà user đã đăng ký
 * 
 * @route GET /api/course/:id/enrolled/user
 * @access Private
 * @param {Request} req - Đối tượng request của Express, chứa account ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa danh sách khoá học đã đăng ký
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function getEnrolledCourses(req: Request, res: Response): Promise<void> {
    // Lấy accountId từ params của request
    const accountId = req.params.id;

    try {
        // Kết nối tới database

    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Truy vấn lấy tất cả khoá học mà user đã đăng ký, chỉ lấy khoá học chưa bị vô hiệu hoá
        // Thêm mới khóa học vào database
        const result = await pool.request()
            .input('AccountId', sql.Int, accountId) // Đảm bảo truyền đúng kiểu dữ liệu cho AccountId
            .query(
                `SELECT e.EnrollmentID, e.CourseID, e.AccountID, e.CompletedDate, e.Status, c.CourseName, c.Description, c.ImageUrl, c.IsDisabled 
                FROM Enrollment e JOIN Course c ON e.CourseID = c.CourseID
                WHERE AccountID = @AccountID AND c.IsDisabled = 0
                `
            );

        // Trả về danh sách khoá học đã đăng ký cho client
        res.status(200).json({
            message: 'Enrolled courses fetched successfully',
            data: result.recordset
            .input('CourseName', sql.NVarChar, CourseName)
            .input('Description', sql.NVarChar, Description)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled || false)
            .query(`
                INSERT INTO Course (CourseName, Description, ImageUrl, IsDisabled)
                VALUES (@CourseName, @Description, @ImageUrl, @IsDisabled);
                SELECT SCOPE_IDENTITY() AS CourseID;
            `);

        // Trả về ID khóa học vừa tạo
        res.status(201).json({
            message: 'Tạo khóa học thành công',
            data: { CourseID: result.recordset[0].CourseID }
        });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        console.error('Error in getEnrolledCourses:', err);
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi tạo khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi tạo khóa học',
            error: err.message
        });
    }
}

/**
 * Hoàn thành khoá học cho user và gửi email chúc mừng
 * Cập nhật một khóa học theo ID
 * 
 * @route PATCH /api/course/:id/complete
 * @access Public (có xác thực)
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params và account ID trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON thông báo hoàn thành khoá học
 * @throws {404} Nếu không tìm thấy enrollment
 * @throws {500} Nếu có lỗi truy vấn database
 * @route PUT /api/courses/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin khóa học đã cập nhật
 * @throws {400} Nếu dữ liệu khóa học không hợp lệ
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi server
 */
export async function completeCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params và accountId từ body
export async function updateCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    const { accountId } = req.body;
    // Lấy thời gian hoàn thành hiện tại
    const completedDate = new Date().toISOString();

    try {
        // Kết nối tới database
        const pool = await poolPromise;

        // Kiểm tra enrollment tồn tại và lấy thông tin user + khoá học
        const checkResult = await pool.request()
            .input('CourseId', sql.Int, courseId) // Đảm bảo truyền đúng kiểu dữ liệu cho CourseId
            .input('AccountId', sql.Int, accountId) // Đảm bảo truyền đúng kiểu dữ liệu cho AccountId
            .query(`
                SELECT e.*, c.CourseName, a.FullName, a.Email 
                FROM Enrollment e 
                JOIN Course c ON e.CourseID = c.CourseID 
                JOIN Account a ON e.AccountID = a.AccountID
                WHERE e.CourseID = @CourseId AND e.AccountID = @AccountId
            `);

        // Nếu không tìm thấy enrollment thì trả về lỗi
        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: 'Enrollment not found' });
            return;
        }

        const enrollment = checkResult.recordset[0];

        // Kiểm tra nếu đã hoàn thành khoá học trước đó
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

        // Cập nhật trạng thái enrollment thành Completed và lưu ngày hoàn thành
        await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .input('CompletedDate', sql.DateTime, completedDate)
            .query(`
                UPDATE Enrollment 
                SET Status = 'Completed', CompletedDate = @CompletedDate
                WHERE CourseID = @CourseId AND AccountID = @AccountId
            `);

        // Gửi email chúc mừng hoàn thành khoá học
        try {
            // Định dạng ngày hoàn thành theo chuẩn Việt Nam
            const formattedDate = new Date(completedDate).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Tạo nội dung email HTML
            const emailHtml = courseCompletionTemplate(
                enrollment.FullName || 'Học viên',
                enrollment.CourseName,
                formattedDate
            );

            // Gửi email cho user
            await sendEmail(
                enrollment.Email,
                `🎉 Chúc mừng bạn đã hoàn thành khóa học "${enrollment.CourseName}"!`,
                emailHtml
            );

        } catch (emailError) {
            // Nếu gửi email thất bại thì chỉ log lỗi, không ảnh hưởng tới kết quả trả về
            console.error('Failed to send course completion email:', emailError);
        }

        // Trả về kết quả thành công cho client
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
        // Ghi log lỗi và trả về lỗi cho client
        console.error('Error in completeCourse:', err);
        res.status(500).json({
            message: 'Có lỗi trong quá trình xử lý',
            error: err.message
        });
    const { CourseName, Description, ImageUrl, IsDisabled } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!CourseName || !Description) {
        res.status(400).json({ message: 'Tên và mô tả khóa học là bắt buộc' });
        return;
    }
}

/**
 * Lấy thông tin khoá học đã hoàn thành theo courseId và accountId
 * 
 * @route GET /api/course/:courseId/completed/:accountId
 * @access Private
 * @param {Request} req - Đối tượng request của Express, chứa courseId và accountId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa thông tin khoá học đã hoàn thành
 * @throws {404} Nếu không tìm thấy enrollment
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function getCompletedCourseById(req: Request, res: Response): Promise<void> {
    // Lấy courseId và accountId từ params của request
    const { courseId, accountId } = req.params;

    try {
        // Kết nối tới database
        // Kết nối tới database
        const pool = await poolPromise;
        // Truy vấn enrollment đã hoàn thành dựa trên courseId và accountId
        // Cập nhật thông tin khóa học trong database
        const result = await pool.request()
            .input('CourseId', sql.Int, courseId) // Đảm bảo truyền đúng kiểu dữ liệu cho CourseId
            .input('AccountId', sql.Int, accountId) // Đảm bảo truyền đúng kiểu dữ liệu cho AccountId
            .query('SELECT * FROM Enrollment WHERE CourseID = @CourseId AND AccountID = @AccountId AND Status = \'Completed\'');

        // Nếu không tìm thấy enrollment thì trả về lỗi
            .input('CourseID', sql.Int, courseId)
            .input('CourseName', sql.NVarChar, CourseName)
            .input('Description', sql.NVarChar, Description)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled || false)
            .query(`
                UPDATE Course
                SET CourseName = @CourseName,
                    Description = @Description,
                    ImageUrl = @ImageUrl,
                    IsDisabled = @IsDisabled
                WHERE CourseID = @CourseID;
                SELECT * FROM Course WHERE CourseID = @CourseID;
            `);

        // Kiểm tra nếu không có khóa học nào được cập nhật
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }

        // Trả về thông tin enrollment đã hoàn thành cho client
        // Trả về dữ liệu khóa học đã cập nhật
        res.status(200).json({
            message: 'Cập nhật khóa học thành công',
            data: result.recordset[0]
        });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        console.error('Error in getCourseProgress:', err);
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi cập nhật khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật khóa học',
            error: err.message
        });
    }
}

/**
 * Huỷ đăng ký (unenroll) khoá học đã đăng ký cho user
 * Xóa một khóa học theo ID
 * 
 * @route DELETE /api/course/:id/unenroll
 * @access Private
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params và account ID trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON thông báo huỷ đăng ký thành công
 * @throws {404} Nếu không tìm thấy enrollment
 * @throws {500} Nếu có lỗi truy vấn database
 * @route DELETE /api/courses/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận xóa
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi server
 */
export async function unenrollCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params và accountId từ body
export async function deleteCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        // Kết nối tới database
        // Kết nối tới database
        const pool = await poolPromise;

        // Kiểm tra xem user đã đăng ký khoá học này chưa
        const checkEnrollment = await pool.request()
            .input('CourseID', sql.Int, courseId) // Đảm bảo truyền đúng kiểu dữ liệu cho CourseID
            .input('AccountID', sql.Int, accountId) // Đảm bảo truyền đúng kiểu dữ liệu cho AccountID
            .query(`
                SELECT EnrollmentID, Status 
                FROM Enrollment 
                WHERE CourseID = @CourseID AND AccountID = @AccountID
            `);

        // Nếu chưa đăng ký thì trả về lỗi
        if (checkEnrollment.recordset.length === 0) {
            res.status(404).json({ 
                success: false, 
                message: 'Bạn chưa đăng ký khóa học này' 
            });
        // Xóa khóa học khỏi database
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query('DELETE FROM Course WHERE CourseID = @CourseID');

        // Kiểm tra nếu không có khóa học nào bị xóa
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }

        const enrollment = checkEnrollment.recordset[0];

        // Nếu khoá học đã hoàn thành thì không cho phép huỷ đăng ký
        if (enrollment.Status === 'Completed') {
            res.status(400).json({ 
                success: false, 
                message: 'Không thể hủy đăng ký khóa học đã hoàn thành' 
            });
            return;
        }

        // Xoá bản ghi enrollment khỏi database
        await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                DELETE FROM Enrollment 
                WHERE CourseID = @CourseID AND AccountID = @AccountID
            `);

        // Giảm số lượng EnrollCount của khoá học đi 1 (nếu lớn hơn 0)
        await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query(`
                UPDATE Course 
                SET EnrollCount = EnrollCount - 1 
                WHERE CourseID = @CourseID AND EnrollCount > 0
            `);

        // Trả về kết quả thành công cho client
        res.status(200).json({ 
            success: true, 
            message: 'Hủy đăng ký khóa học thành công' 
        });

        // Trả về thông báo thành công
        res.status(200).json({ message: 'Xóa khóa học thành công' });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        console.error('Error in unenrollCourse:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi hủy đăng ký khóa học', 
            error: err.message 
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi xóa khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi xóa khóa học',
            error: err.message
        });
    }
}

/**
 * Tạo mới khoá học
 * 
 * @route POST /api/course
 * @access Admin
 * @param {Request} req - Đối tượng request của Express, chứa thông tin khoá học trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa khoá học vừa tạo
 * @throws {400} Nếu thiếu dữ liệu đầu vào
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function createCourse(req: Request, res: Response): Promise<void> {
    // Lấy dữ liệu khoá học từ body của request
    const { CourseName, Risk, Duration, Description, EnrollCount, ImageUrl, Status, IsDisabled } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!CourseName || !Risk || !Status) {
        res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
        return;
    }
    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Thực hiện truy vấn thêm khoá học mới vào bảng Course với các tham số đã được truyền vào
        const result = await pool.request()
            .input('CourseName', sql.NVarChar, CourseName) // Tên khoá học
            .input('Risk', sql.NVarChar, Risk) // Mức độ rủi ro
            .input('Duration', sql.Int, Duration) // Thời lượng khoá học
            .input('Description', sql.NVarChar, Description) // Mô tả khoá học
            .input('EnrollCount', sql.Int, EnrollCount) // Số lượng học viên đã đăng ký
            .input('ImageUrl', sql.NVarChar, ImageUrl) // Đường dẫn ảnh khoá học
            .input('Status', sql.NVarChar, Status) // Trạng thái khoá học
            .input('IsDisabled', sql.Bit, IsDisabled) // Trạng thái vô hiệu hoá
            .query(`INSERT INTO Course (CourseName, Risk, Duration, Description, EnrollCount, ImageUrl, Status, IsDisabled)
                    OUTPUT INSERTED.
                    VALUES (@CourseName, @Risk, @Duration, @Description, @EnrollCount, @ImageUrl, @Status, @IsDisabled)`);
        // Trả về kết quả thành công cho client
        res.status(201).json({ message: 'Tạo khoá học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        res.status(500).json({ message: 'Lỗi khi tạo khoá học', error: err.message });
    }
}

/**
 * Cập nhật khoá học theo ID
 * 
 * @route PUT /api/course/:id
 * @access Admin
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params và các trường cần cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON chứa khoá học sau khi cập nhật
 * @throws {400} Nếu không có dữ liệu để cập nhật
 * @throws {404} Nếu không tìm thấy khoá học
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function updateCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params (ID khoá học)
    const courseId = Number(req.params.id);
    // Kiểm tra courseId hợp lệ
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'courseId không hợp lệ' });
        return;
    }
    // Lấy dữ liệu cập nhật từ body
    const fields = req.body;
    // Kiểm tra dữ liệu cập nhật có tồn tại không
    if (!fields || Object.keys(fields).length === 0) {
        res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
        return;
    }
    // Chuẩn bị câu lệnh cập nhật động và tham số
    const updates: string[] = [];
    const params: any = { CourseID: courseId };
    Object.entries(fields).forEach(([key, value]) => {
        updates.push(`${key} = @${key}`);
        params[key] = value;
    });
    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Tạo câu lệnh SQL cập nhật khoá học
        const sqlUpdate = `
            UPDATE Course SET ${updates.join(', ')}
            WHERE CourseID = @CourseID;
            SELECT * FROM Course WHERE CourseID = @CourseID
        `;
        // Gán tham số cho câu lệnh truy vấn
        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });
        // Thực thi truy vấn cập nhật
        const result = await request.query(sqlUpdate);
        // Kiểm tra nếu không tìm thấy khoá học để cập nhật
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy khoá học' });
            return;
        }
        // Trả về kết quả thành công với khoá học đã cập nhật
        res.status(200).json({ message: 'Cập nhật khoá học thành công', data: result.recordset[0] });
    } catch (err: any) {
        // Trả về lỗi nếu có lỗi xảy ra trong quá trình cập nhật
        res.status(500).json({ message: 'Lỗi khi cập nhật khoá học', error: err.message });
    }
}

/**
 * Xoá khoá học theo ID
 * 
 * @route DELETE /api/course/:id
 * @access Admin
 * @param {Request} req - Đối tượng request của Express, chứa course ID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON thông báo xoá thành công
 * @throws {404} Nếu không tìm thấy khoá học
 * @throws {500} Nếu có lỗi truy vấn database
 */
export async function deleteCourse(req: Request, res: Response): Promise<void> {
    // Lấy courseId từ params và kiểm tra hợp lệ
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'courseId không hợp lệ' });
        return;
    }
    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Thực hiện truy vấn xoá khoá học dựa trên CourseID
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId) // Đảm bảo truyền đúng kiểu dữ liệu cho CourseID
            .query('DELETE FROM Course WHERE CourseID = @CourseID');
        // Nếu không tìm thấy khoá học để xoá thì trả về lỗi
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy khoá học' });
            return;
        }
        // Trả về kết quả thành công cho client
        res.status(200).json({ message: 'Xoá khoá học thành công' });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi cho client
        res.status(500).json({ message: 'Lỗi khi xoá khoá học', error: err.message });
    }
}
