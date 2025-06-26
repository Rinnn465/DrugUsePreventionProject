import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { sql, poolPromise } from "../config/database";

dotenv.config();

/**
 * Interface đại diện cho chuyên viên trong cơ sở dữ liệu
 * Ánh xạ tới cấu trúc bảng Consultant
 */
interface Consultant {
    ConsultantID: number;
    Name: string;
    Specialization: string;
    Experience: string;
    IsAvailable: boolean;
}

/**
 * Lấy tất cả chuyên viên từ cơ sở dữ liệu
 *
 * @route GET /api/consultants
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng chuyên viên
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getConsultants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Kết nối tới database thông qua poolPromise
        const pool = await poolPromise;
        // Truy vấn danh sách chuyên viên và lịch trình bằng JOIN
        const result = await pool.request().query(`
        SELECT c.ConsultantID ,c.Name, c.Bio, c.Title, c.ImageUrl, c.IsDisabled, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
        FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
        WHERE c.IsDisabled = 0
        `);
        // Trả về danh sách chuyên viên nếu truy vấn thành công
        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset,
        });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi server
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
}

/**
 * Lấy thông tin chi tiết của một chuyên viên theo ID
 *
 * @route GET /api/consultants/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID chuyên viên trong params
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin chuyên viên
 * @throws {404} Nếu không tìm thấy chuyên viên
 * @throws {500} Nếu có lỗi server
 */
export async function getConsultantById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // Lấy consultantId từ tham số URL
    const consultantId = req.params.id;

    try {
        // Kết nối tới database thông qua poolPromise
        const pool = await poolPromise;
        // Truy vấn thông tin chuyên viên và lịch trình bằng tham số hóa để đảm bảo an toàn
        const result = await pool
            .request()
            .input("consultantId", sql.Int, consultantId)
            .query(`SELECT * 
            FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
            WHERE cs.ConsultantId = @consultantId`);

        // Kiểm tra chuyên viên có tồn tại không
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Consultant not found" });
            return;
        }

        // Trả về dữ liệu chuyên viên nếu tìm thấy
        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset[0],
        });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi server
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

/**
 * Lấy tất cả bằng cấp và chuyên viên liên kết
 * Sử dụng JOIN để lấy mối quan hệ bằng cấp - chuyên viên
 *
 * @route GET /api/consultants/qualifications
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với dữ liệu bằng cấp
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getQualifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;

        // Join query to get qualifications with consultant associations
        const result = await pool.request().query(
            `SELECT q.QualificationID, q.Name, cq.ConsultantID  
               FROM Qualification q JOIN ConsultantQualification cq ON q.QualificationID = cq.QualificationID`
        );
        res
            .status(200)
            .json({ message: "Tải dữ liệu bằng cấp thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

/**
 * Lấy tất cả chuyên môn và chuyên viên liên kết
 * Sử dụng JOIN để lấy mối quan hệ chuyên môn - chuyên viên
 *
 * @route GET /api/consultants/specialties
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với dữ liệu chuyên môn
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getSpecialties(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Kết nối tới database thông qua poolPromise
        const pool = await poolPromise;
        // Truy vấn JOIN để lấy danh sách chuyên môn và chuyên viên liên kết
        const result = await pool.request().query(
            `SELECT s.SpecialtyID, s.Name, cs.ConsultantID 
               FROM Specialty s JOIN ConsultantSpecialty cs ON s.SpecialtyID = cs.SpecialtyID`
        );
        // Trả về dữ liệu chuyên môn nếu truy vấn thành công
        res
            .status(200)
            .json({ message: "Tải dữ liệu chuyên môn thành công", data: result.recordset });
        return;
    } catch (err: any) {
        // Ghi log lỗi và ném lỗi server
        console.error(err);
        throw new Error("Server error");
    }
}

/**
 * Lấy toàn bộ lịch trình của chuyên viên
 * Lấy tất cả bản ghi từ bảng ConsultantSchedule
 * @route GET /api/consultants/schedule
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với lịch trình chuyên viên
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
// export async function getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
//     try {
//         const pool = await poolPromise;
//         const result = await pool.request()
//             .execute('SELECT * FROM ConsultantSchedule');

//         res.status(200).json(result.recordset);
//     } catch (error) {
//         console.error('Error fetching schedule:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

// export async function getConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
//     const { consultantId } = req.params;

//     if (!consultantId) {
//         res.status(400).json({ message: 'Consultant ID is required' });
//         return
//     }

//     try {
//         const pool = await poolPromise;
//         const result = await pool.request()
//             .input('ConsultantID', sql.Int, consultantId)
//             .query('SELECT * FROM ConsultantSchedule WHERE ConsultantID = @ConsultantID');

//         res.status(200).json(result.recordset);
//     } catch (error) {
//         console.error('Error fetching consultant schedule:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }
