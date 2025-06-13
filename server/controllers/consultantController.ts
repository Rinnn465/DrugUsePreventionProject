import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { sql, poolPromise } from "../config/database";

dotenv.config();

export async function getConsultants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
        SELECT c.ConsultantID ,c.Name, c.Bio, c.Title, c.ImageUrl, c.IsDisabled, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
        FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
        WHERE c.IsDisabled = 0
        `);
        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export async function getConsultantById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const consultantId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("consultantId", sql.Int, consultantId)
            .query(`SELECT * 
            FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
            WHERE cs.ConsultantId = @consultantId`);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Consultant not found" });
            return;
        }

        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset[0],
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export async function getQualifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT q.QualificationID, q.Name, cq.ConsultantID  
               FROM Qualifications q JOIN ConsultantQualification cq ON q.QualificationID = cq.QualificationID`);
        res.status(200).json({ message: "Tải dữ liệu bằng cấp thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

export async function getSpecialties(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT s.SpecialtyID, s.Name, cs.ConsultantID 
               FROM Specialties s JOIN ConsultantSpecialty cs ON s.SpecialtyID = cs.SpecialtyID`);
        res.status(200).json({ message: "Tải dữ liệu chuyên môn thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

export async function getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('SELECT * FROM ConsultantSchedule');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .query('SELECT * FROM ConsultantSchedule WHERE ConsultantID = @ConsultantID');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching consultant schedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
