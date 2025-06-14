import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

// Get all Program Attendees
export async function getAllProgramAttendees(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT * FROM CommunityProgramAttendee
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//Get Total Attendees by ProgramID
export async function getTotalAttendeesByProgramId(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT COUNT(*) AS total
                FROM CommunityProgramAttendee
                WHERE ProgramID = @ProgramID
            `);
        res.json({ total: result.recordset[0].total });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// GET Community Program Attendee by ProgramID and AccountID
export async function getAttendeeById(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = Number(req.params.accountId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT * FROM CommunityProgramAttendee
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);
        const attendee = result.recordset[0];
        if (!attendee) {
            res.status(404).json({ message: "Attendee not found" });
            return;
        }
        res.json(attendee);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}
