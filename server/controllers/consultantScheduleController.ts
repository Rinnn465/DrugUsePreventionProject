import e, { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

interface ConsultantSchedule {
    ConsultantID: number;
    ScheduleID: number;
    Date: Date;
    StartTime: string;
    EndTime: string;
}

/**
 * Retrieves all consultant schedules from the database.
 *
 * @route GET /api/consultant-schedules
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with all consultant schedules
 * @throws {500} If server error occurs
 */
export async function getSchedules(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request().query(`
            SELECT cs.ConsultantID, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
            FROM ConsultantSchedule cs
            JOIN Consultant c ON cs.ConsultantID = c.ConsultantID
            WHERE c.IsDisabled = 0
        `); // Query all consultant schedules for active consultants
        res.status(200).json({
            message: "Tải lịch trình chuyên viên thành công",
            data: result.recordset,
        }); // Send schedules as response
    } catch (err: any) {
        console.error(err); // Log error
        res.status(500).json({ message: "Server error", error: err.message }); // Send error response
    }
}

/**
 * Retrieves a consultant schedule by its ScheduleID.
 *
 * @route GET /api/consultant-schedules/:id
 * @access Public
 * @param {Request} req - Express request object with schedule ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with schedule details
 * @throws {404} If schedule is not found
 * @throws {500} If server error occurs
 */
export async function getScheduleByScheduleId(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const scheduleId = parseInt(req.params.id, 10); // Extract ScheduleID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
            .input("ScheduleID", sql.Int, scheduleId)
            .query(`
                SELECT cs.ConsultantID, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
                FROM ConsultantSchedule cs
                WHERE cs.ScheduleID = @ScheduleID
            `); // Query schedule by ScheduleID

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Lịch trình không tìm thấy" }); // Not found
            return;
        }

        res.status(200).json(result.recordset[0]); // Send schedule details
    } catch (err: any) {
        console.error(err); // Log error
        res.status(500).json({ message: "Server error", error: err.message }); // Send error response
    }
}

/**
 * Retrieves all schedules for a specific consultant by ConsultantID.
 *
 * @route GET /api/consultants/:id/schedules
 * @access Public
 * @param {Request} req - Express request object with consultant ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with consultant's schedules
 * @throws {404} If no schedules are found for the consultant
 * @throws {500} If server error occurs
 */
export async function getSchedulesByConsultantId(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const consultantId = parseInt(req.params.id, 10); // Extract ConsultantID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
            .input("ConsultantID", sql.Int, consultantId)
            .query(`
                SELECT cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
                FROM ConsultantSchedule cs
                WHERE cs.ConsultantID = @ConsultantID
            `); // Query schedules by ConsultantID

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch trình cho chuyên viên này" }); // Not found
            return;
        }

        res.status(200).json(result.recordset); // Send schedules as response
    } catch (err: any) {
        console.error(err); // Log error
        res.status(500).json({ message: "Server error", error: err.message }); // Send error response
    }
}

/**
 * Creates a new consultant schedule.
 *
 * @route POST /api/consultant-schedules
 * @access Public
 * @param {Request} req - Express request object with schedule details in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response confirming creation
 * @throws {400} If required fields are missing or invalid
 * @throws {500} If server error occurs
 */
export async function createSchedule(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const { ConsultantID, Date, StartTime, EndTime }: ConsultantSchedule = req.body; // Extract schedule details from request body
    try {
        const pool = await poolPromise; // Get database connection
        const insertResult = await pool.request()
            .input("ConsultantID", sql.Int, ConsultantID)
            .input("Date", sql.Date, Date)
            .input("StartTime", sql.Time, StartTime)
            .input("EndTime", sql.Time, EndTime)
            .query(`
                INSERT INTO ConsultantSchedule (ConsultantID, Date, StartTime, EndTime)
                VALUES (@ConsultantID, @Date, @StartTime, @EndTime);
            `); // Insert new schedule

        res.status(201).json({
            message: "Lịch trình chuyên viên đã được tạo thành công",
            scheduleId: insertResult.recordset[0].ScheduleID, // Return new schedule ID
        }); // Send success response
    } catch (err: any) {
        console.error(err); // Log error
        res.status(500).json({ message: "Server error", error: err.message }); // Send error response
    }
}

/**
 * Updates an existing consultant schedule by ScheduleID.
 *
 * @route PUT /api/consultant-schedules/:id
 * @access Public
 * @param {Request} req - Express request object with schedule ID in params and updated details in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response confirming update
 * @throws {404} If schedule is not found
 * @throws {500} If server error occurs
 */
export async function updateSchedule(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const scheduleId = parseInt(req.params.id, 10); // Extract ScheduleID from URL
    const { ConsultantID, Date, StartTime, EndTime }: ConsultantSchedule = req.body; // Extract updated details from request body

    try {
        const pool = await poolPromise; // Get database connection
        const updateResult = await pool.request()
            .input("ScheduleID", sql.Int, scheduleId)
            .input("ConsultantID", sql.Int, ConsultantID)
            .input("Date", sql.Date, Date)
            .input("StartTime", sql.Time, StartTime)
            .input("EndTime", sql.Time, EndTime)
            .query(`
                UPDATE ConsultantSchedule
                SET ConsultantID = @ConsultantID,
                    Date = @Date,
                    StartTime = @StartTime,
                    EndTime = @EndTime
                WHERE ScheduleID = @ScheduleID;
            `); // Update existing schedule

        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lịch trình không tìm thấy" }); // Not found
            return;
        }

        res.status(200).json({ message: "Lịch trình chuyên viên đã được cập nhật thành công" }); // Send success response
    } catch (err: any) {
        console.error(err); // Log error
        res.status(500).json({ message: "Server error", error: err.message }); // Send error response
    }
}

/**
 * Xóa một lịch trình chuyên viên theo ScheduleID.
 *
 * @route DELETE /api/consultant-schedules/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ScheduleID trong params
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận xóa
 * @throws {404} Nếu không tìm thấy lịch trình
 * @throws {500} Nếu có lỗi server
 */
export async function deleteSchedule(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // Lấy ScheduleID từ URL
    const scheduleId = parseInt(req.params.id, 10);
    try {
        // Kết nối tới database
        const pool = await poolPromise;
        // Thực hiện truy vấn xóa lịch trình theo ScheduleID
        const deleteResult = await pool.request()
            .input("ScheduleID", sql.Int, scheduleId)
            .query(`
                DELETE FROM ConsultantSchedule
                WHERE ScheduleID = @ScheduleID;
            `);

        // Kiểm tra nếu không có lịch trình nào bị xóa (không tìm thấy)
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lịch trình không tìm thấy" });
            return;
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({ message: "Lịch trình chuyên viên đã được xóa thành công" });
    } catch (err: any) {
        // Ghi log lỗi và trả về lỗi server
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
}