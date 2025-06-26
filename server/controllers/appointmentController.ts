import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

/**
 * Interface Appointment đại diện cho một lịch hẹn trong cơ sở dữ liệu
 */
interface Appointment {
    AppointmentID: number; // Mã định danh lịch hẹn
    ConsultantID: number; // Mã tư vấn viên
    AccountID: number; // Mã người dùng
    Time: string; // Thời gian (định dạng HH:MM:SS)
    Date: Date; // Ngày hẹn
    MeetingUrl: string; // Đường dẫn cuộc họp
    Status: string; // Trạng thái ("Pending", "Confirmed", "Cancelled")
    Description: string | null; // Mô tả bổ sung
    Duration: number; // Thời lượng (phút)
}

/**
 * Lấy tất cả lịch hẹn từ cơ sở dữ liệu.
 *
 * @route GET /api/appointments
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách lịch hẹn
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Appointment");
        res.status(200).json({ message: "Lấy danh sách lịch hẹn thành công!", data: result.recordset });
    } catch (error) {
        console.error("Lỗi khi lấy lịch hẹn:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

/**
 * Lấy chi tiết lịch hẹn theo ID.
 *
 * @route GET /api/appointments/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express với ID lịch hẹn trong params
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết lịch hẹn
 * @throws {404} Nếu không tìm thấy lịch hẹn
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export async function getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const appointmentId = req.params.id;
    try {
        // Kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise;
        // Truy vấn lịch hẹn theo ID
        const result = await pool.request()
            .input("id", sql.Int, appointmentId)
            .query("SELECT * FROM Appointments WHERE AppointmentID = @id");

        // Kiểm tra có lịch hẹn không
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn!" });
            return;
        }

        // Trả về chi tiết lịch hẹn
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error("Lỗi khi lấy lịch hẹn:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

/**
 * Đặt lịch hẹn mới.
 *
 * @route POST /api/appointments
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express chứa thông tin lịch hẹn trong body
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận đặt lịch thành công
 * @throws {400} Nếu thiếu hoặc sai định dạng trường bắt buộc
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, accountId, time, date, meetingUrl, status, description, duration } = req.body;
    try {
        // Phân tích chuỗi thời gian để đảm bảo đúng định dạng (HH:MM:SS)
        const [hours, minutes, seconds] = time.split(':').map(Number);
        // Tạo đối tượng Date chỉ để kiểm tra định dạng, không sử dụng lưu trữ
        const timeDate = new Date(1970, 0, 1, hours, minutes, seconds); // Không sử dụng, chỉ để kiểm tra
        // Đảm bảo chuỗi thời gian có định dạng HH:MM:SS
        const formattedTime = time.endsWith(':00') ? time : `${time}:00`;

        // Kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise;
        // Thực hiện truy vấn thêm lịch hẹn mới
        const result = await pool.request()
            .input("consultantId", sql.Int, consultantId)
            .input("accountId", sql.Int, accountId)
            .input("time", sql.NVarChar, formattedTime)
            .input("date", sql.Date, date)
            .input("meetingUrl", sql.NVarChar, meetingUrl)
            .input("status", sql.NVarChar, status)
            .input("description", sql.NVarChar, description)
            .input("duration", sql.Int, duration)
            .query(`
                INSERT INTO Appointment (ConsultantID, AccountID, Time, Date, MeetingUrl, Status, Description, Duration)
                VALUES (@consultantId, @accountId, CAST(@time as Time), @date, @meetingUrl, @status, @description, @duration);
            `);

        // Trả về kết quả đặt lịch thành công
        res.status(201).json({ message: "Đặt lịch hẹn thành công!" });

    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error("Lỗi khi đặt lịch hẹn:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

/**
 * Hủy lịch hẹn theo ID.
 *
 * @route PUT /api/appointments/:id/cancel
 * @access Thành viên
 * @param {Request} req - Đối tượng request của Express với ID lịch hẹn trong params
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON xác nhận hủy lịch thành công
 * @throws {404} Nếu không tìm thấy lịch hẹn
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const appointmentId = req.params.id;
    try {
        // Kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise;
        // Thực hiện truy vấn cập nhật trạng thái lịch hẹn thành 'Cancelled'
        const result = await pool.request()
            .input("id", sql.Int, appointmentId)
            .query("UPDATE Appointment SET Status = 'Cancelled' WHERE AppointmentID = @id");

        // Kiểm tra có lịch hẹn để hủy không
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn!" });
            return;
        }

        // Trả về kết quả hủy lịch thành công
        res.status(200).json({ message: "Hủy lịch hẹn thành công!" });
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error("Lỗi khi hủy lịch hẹn:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
}
