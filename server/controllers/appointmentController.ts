import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Appointment");
        res.status(200).json({ message: "Lấy danh sách lịch hẹn thành công!", data: result.recordset });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

export async function getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const appointmentId = req.params.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, appointmentId)
            .query("SELECT * FROM Appointments WHERE AppointmentID = @id");

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn!" });
            return;
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

export async function getAppointmentByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query("SELECT * FROM Appointment WHERE AccountID = @userId");

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn cho người dùng này!", data: [] });
            return;
        }

        res.status(200).json({ message: "Không tìm thấy lịch hẹn cho người dùng này!", data: result.recordset });
    } catch (error) {
        console.error("Error fetching appointment by user ID: ", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, accountId, time, date, meetingUrl, status, description, duration } = req.body;
    try {
        const formattedTime = time.endsWith(':00') ? time : `${time}:00`; // Ensure time is in HH:MM:SS format

        const pool = await poolPromise;
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
                INSERT INTO Appointment (ConsultantID, AccountID, Time, Date, MeetingURL, Status, Description, Duration)
                VALUES (@consultantId, @accountId, CAST(@time as Time), @date, @meetingUrl, @status, @description, @duration);
            `);

        res.status(201).json({ message: "Đặt lịch hẹn thành công!" });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};



export async function approveAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { appointmentId } = req.params;

    try {
        const pool = await poolPromise;

        // Generate meeting URL (you can integrate with your preferred meeting platform)
        const meetingUrl = `https://meet.example.com/appointment-${appointmentId}`;

        const result = await pool.request()
            .input('AppointmentID', sql.Int, appointmentId)
            .input('MeetingURL', sql.NVarChar, meetingUrl)
            .query(`
                UPDATE Appointment 
                SET Status = 'confirmed', MeetingURL = @MeetingURL
                WHERE AppointmentID = @AppointmentID
            `);

        res.status(200).json({
            message: 'Phê duyệt cuộc hẹn thành công',
            meetingUrl: meetingUrl
        });
    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).json({ message: 'Lỗi server khi phê duyệt cuộc hẹn' });
    }
}

/**
 * Reject appointment
 */
export async function rejectAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { appointmentId } = req.params;
    const { rejectionReason } = req.body;


    if (!rejectionReason || rejectionReason.trim().length === 0) {
        res.status(400).json({ message: 'Lý do từ chối là bắt buộc' });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('AppointmentID', sql.Int, appointmentId)
            .input('RejectionReason', sql.NVarChar, rejectionReason.trim())
            .query(`
                UPDATE Appointment 
                SET Status = 'rejected', RejectedReason = @RejectionReason
                WHERE AppointmentID = @AppointmentID
            `);

        res.status(200).json({ message: 'Từ chối cuộc hẹn thành công', stats: '', reject: rejectionReason });
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        res.status(500).json({ message: 'Lỗi server khi từ chối cuộc hẹn' });
    }
}


export async function getAppointmentsByFilter(req: Request, res: Response, next: NextFunction): Promise<void> {
    const consultantId = req.query.consultantId as string;
    const date = req.query.date as string;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("consultantId", sql.Int, parseInt(consultantId))
            .input("date", sql.Date, new Date(date))
            .query(`
                SELECT * FROM Appointment
                WHERE ConsultantID = @consultantId AND CAST(Date AS DATE) = CAST(@date AS DATE);
            `);

        res.status(200).json({ message: "Lấy lịch hẹn thành công!", data: result.recordset });
    } catch (error) {
        console.error("Error fetching appointments by filter:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
}