import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Appointments");
        res.status(200).json(result.recordset);
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

export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, accountId, time, date, meetingUrl, status, description, duration } = req.body;
    try {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const timeDate = new Date(1970, 0, 1, hours, minutes, seconds);

        const pool = await poolPromise;
        const result = await pool.request()
            .input("consultantId", sql.Int, consultantId)
            .input("accountId", sql.Int, accountId)
            .input("time", sql.Time, timeDate)
            .input("date", sql.Date, date)
            .input("meetingUrl", sql.NVarChar, meetingUrl)
            .input("status", sql.NVarChar, status)
            .input("description", sql.NVarChar, description)
            .input("duration", sql.Int, duration)
            .query(`
                INSERT INTO Appointment (ConsultantID, AccountID, Time, Date, MeetingUrl, Status, Description, Duration)
                VALUES (@consultantId, @accountId, @time, @date, @meetingUrl, @status, @description, @duration);
            `);

        res.status(201).json({ message: "Đặt lịch hẹn thành công!" });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};