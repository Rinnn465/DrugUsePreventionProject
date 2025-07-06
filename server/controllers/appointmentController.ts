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

export async function getAppointmentByMemberId(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.params.id;
    console.log(`Fetching appointments for user ID: ${userId}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`SELECT * FROM Appointment WHERE AccountID = @userId`);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn cho người dùng này!", data: [] });
            return;
        }

        res.status(200).json({ message: "Tìm lịch hẹn thành công", data: result.recordset });
    } catch (error) {
        console.log("Error fetching appointment by user ID: ", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

export async function getAppointmentByConsultantId(req: Request, res: Response, next: NextFunction): Promise<void> {
    const consultantId = req.params.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("consultantId", sql.Int, consultantId)
            .query(`
                SELECT a.AppointmentID, a.ConsultantID, a.AccountID, a.Time, a.Date, 
                a.Status, a.Description, a.Duration, a.RejectedReason, a.Rating, a.Feedback
                , ac.Fullname AS CustomerName, ac.Email AS CustomerEmail
                FROM Appointment a JOIN Account ac ON a.AccountID = ac.AccountID 
                WHERE ConsultantID = @consultantId
                ORDER BY a.Date ASC, a.Time ASC;  
                `);

        if (!result.recordset) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn cho chuyên gia này!", data: [] });
            return;
        }

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn cho chuyên gia này!", data: [] });
            return;
        }

        res.status(200).json({ message: "Tìm lịch hẹn thành công", data: result.recordset });
    } catch (error) {
        console.log("Error fetching appointment by consultant ID: ", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
}

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

export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { appointmentId } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('AppointmentID', sql.Int, appointmentId)
            .query(`
                DELETE
                FROM Appointment 
                WHERE AppointmentID = @AppointmentID
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy cuộc hẹn để hủy' });
            return;
        }

        res.status(200).json({ message: 'Hủy cuộc hẹn thành công' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Lỗi server khi hủy cuộc hẹn' });
    }
}

export async function rateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { appointmentId } = req.params;
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('AppointmentID', sql.Int, appointmentId)
            .input('Rating', sql.Int, rating)
            .input('Feedback', sql.NVarChar, feedback || '')
            .query(`
                UPDATE Appointment 
                SET Rating = @Rating, Feedback = @Feedback
                WHERE AppointmentID = @AppointmentID
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy cuộc hẹn để đánh giá' });
            return;
        }

        res.status(200).json({ message: 'Đánh giá cuộc hẹn thành công' });
    } catch (error) {
        console.error('Error rating appointment:', error);
        res.status(500).json({ message: 'Lỗi server khi đánh giá cuộc hẹn' });
    }
}

export async function completeAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { appointmentId } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('AppointmentID', sql.Int, appointmentId)
            .query(`
                UPDATE Appointment 
                SET Status = 'completed'
                WHERE AppointmentID = @AppointmentID
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Không tìm thấy cuộc hẹn để hoàn thành' });
            return;
        }

        res.status(200).json({ message: 'Hoàn thành cuộc hẹn thành công' });
    } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ message: 'Lỗi server khi hoàn thành cuộc hẹn' });
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