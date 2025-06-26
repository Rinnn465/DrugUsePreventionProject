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
 * Lấy tất cả các khóa học đang hoạt động từ cơ sở dữ liệu
 * 
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
            message: 'Lấy danh sách khóa học thành công',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi trong getCourses:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách khóa học',
            error: err.message
        });
        return;
    }
}

/**
 * Lấy thông tin chi tiết của một khóa học theo ID
 * 
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
        // Kết nối tới database
        const pool = await poolPromise;
        // Truy vấn khóa học cụ thể với truy vấn tham số hóa để đảm bảo an toàn
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
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi lấy thông tin khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin khóa học',
            error: err.message
        });
        return;
    }
}

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

    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Thêm mới khóa học vào database
        const result = await pool.request()
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
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi tạo khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi tạo khóa học',
            error: err.message
        });
    }
}

/**
 * Cập nhật một khóa học theo ID
 * 
 * @route PUT /api/courses/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin khóa học đã cập nhật
 * @throws {400} Nếu dữ liệu khóa học không hợp lệ
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi server
 */
export async function updateCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    const { CourseName, Description, ImageUrl, IsDisabled } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!CourseName || !Description) {
        res.status(400).json({ message: 'Tên và mô tả khóa học là bắt buộc' });
        return;
    }

    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Cập nhật thông tin khóa học trong database
        const result = await pool.request()
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

        // Trả về dữ liệu khóa học đã cập nhật
        res.status(200).json({
            message: 'Cập nhật khóa học thành công',
            data: result.recordset[0]
        });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi cập nhật khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi cập nhật khóa học',
            error: err.message
        });
    }
}

/**
 * Xóa một khóa học theo ID
 * 
 * @route DELETE /api/courses/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID khóa học trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận xóa
 * @throws {404} Nếu không tìm thấy khóa học
 * @throws {500} Nếu có lỗi server
 */
export async function deleteCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Xóa khóa học khỏi database
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query('DELETE FROM Course WHERE CourseID = @CourseID');

        // Kiểm tra nếu không có khóa học nào bị xóa
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
            return;
        }

        // Trả về thông báo thành công
        res.status(200).json({ message: 'Xóa khóa học thành công' });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi
        console.error('Lỗi khi xóa khóa học:', err);
        res.status(500).json({
            message: 'Lỗi khi xóa khóa học',
            error: err.message
        });
    }
}
