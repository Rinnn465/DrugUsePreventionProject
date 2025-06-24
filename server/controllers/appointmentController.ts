import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

interface Appointment {
    AppointmentID: number;
    ConsultantID: number;
    AccountID: number;
    Time: string; // Stored as string in HH:MM:SS format
    Date: Date; // Stored as date
    MeetingUrl: string;
    Status: string; // e.g., "Pending", "Confirmed", "Cancelled"
    Description: string | null; // Optional description 
    Duration: number; // Duration in minutes
}

/**
 * Retrieves all appointments from the database.
 *
 * @route GET /api/appointments
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with all appointments
 * @throws {500} If a server/database error occurs
 */
export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request().query("SELECT * FROM Appointment"); // Query all appointments
        res.status(200).json({ message: "Lấy danh sách lịch hẹn thành công!", data: result.recordset }); // Send appointments
    } catch (error) {
        console.error("Error fetching appointments:", error); // Log error
        res.status(500).json({ message: "Lỗi server!" }); // Send error response
    }
};

/**
 * Retrieves a specific appointment by its ID.
 *
 * @route GET /api/appointments/:id
 * @access Public
 * @param {Request} req - Express request object with appointment ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with appointment details
 * @throws {404} If the appointment is not found
 * @throws {500} If a server/database error occurs
 */
export async function getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const appointmentId = req.params.id; // Extract appointment ID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
            .input("id", sql.Int, appointmentId) // Use parameterized query for security
            .query("SELECT * FROM Appointments WHERE AppointmentID = @id"); // Query appointment by ID

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn!" }); // Not found
            return;
        }

        res.status(200).json(result.recordset[0]); // Send appointment details
    } catch (error) {
        console.error("Error fetching appointment:", error); // Log error
        res.status(500).json({ message: "Lỗi server!" }); // Send error response
    }
};

/**
 * Books a new appointment.
 *
 * @route POST /api/appointments
 * @access Menber   
 * @param {Request} req - Express request object with appointment details in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response confirming booking
 * @throws {400} If required fields are missing or invalid
 * @throws {500} If a server/database error occurs
 */
export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, accountId, time, date, meetingUrl, status, description, duration } = req.body;
    try {
        // Parse time string to ensure correct format (HH:MM:SS)
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const timeDate = new Date(1970, 0, 1, hours, minutes, seconds); // Not used, but could be for validation
        const formattedTime = time.endsWith(':00') ? time : `${time}:00`; // Ensure time is in HH:MM:SS format

        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
            .input("consultantId", sql.Int, consultantId)
            .input("accountId", sql.Int, accountId)
            .input("time", sql.NVarChar, formattedTime) // Store as string, cast in SQL
            .input("date", sql.Date, date)
            .input("meetingUrl", sql.NVarChar, meetingUrl)
            .input("status", sql.NVarChar, status)
            .input("description", sql.NVarChar, description)
            .input("duration", sql.Int, duration)
            .query(`
                INSERT INTO Appointment (ConsultantID, AccountID, Time, Date, MeetingUrl, Status, Description, Duration)
                VALUES (@consultantId, @accountId, CAST(@time as Time), @date, @meetingUrl, @status, @description, @duration);
            `); // Insert new appointment

        res.status(201).json({ message: "Đặt lịch hẹn thành công!" }); // Send success response

    } catch (error) {
        console.error("Error booking appointment:", error); // Log error
        res.status(500).json({ message: "Lỗi server!" }); // Send error response
    }
};


