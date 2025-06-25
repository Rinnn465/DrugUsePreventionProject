import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

// Get all Program Attendees
export async function getAllProgramAttendees(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                cpa.*,
                cp.ProgramName,
                a.Username,
                a.FullName
            FROM CommunityProgramAttendee cpa
            INNER JOIN CommunityProgram cp ON cpa.ProgramID = cp.ProgramID
            INNER JOIN Account a ON cpa.AccountID = a.AccountID
            ORDER BY cpa.RegistrationDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Get Total Attendees by ProgramID
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

export async function getAttendeeById(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = Number(req.params.accountId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT 
                    cpa.*,
                    cp.ProgramName,
                    a.Username,
                    a.FullName
                FROM CommunityProgramAttendee cpa
                INNER JOIN CommunityProgram cp ON cpa.ProgramID = cp.ProgramID
                INNER JOIN Account a ON cpa.AccountID = a.AccountID
                WHERE cpa.ProgramID = @ProgramID AND cpa.AccountID = @AccountID
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

export async function checkEnrollmentStatus(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT Status, RegistrationDate, SurveyBeforeCompleted, SurveyAfterCompleted
                FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (result.recordset.length === 0) {
            res.json({ 
                isEnrolled: false,
                status: null,
                registrationDate: null,
                SurveyBeforeCompleted: false,
                SurveyAfterCompleted: false
            });
            return;
        }

        const enrollment = result.recordset[0];
        res.json({
            isEnrolled: true,
            status: enrollment.Status,
            registrationDate: enrollment.RegistrationDate,
            SurveyBeforeCompleted: enrollment.SurveyBeforeCompleted,
            SurveyAfterCompleted: enrollment.SurveyAfterCompleted
        });
    } catch (err) {
        console.error("Check enrollment status error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function enrollInProgram(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;

        // Check if program exists and is active
        const programCheck = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT ProgramID, ProgramName FROM CommunityProgram 
                WHERE ProgramID = @ProgramID AND IsDisabled = 0
            `);

        if (programCheck.recordset.length === 0) {
            res.status(404).json({ message: "Program not found or is disabled" });
            return;
        }

        // Check if user is already enrolled
        const existingEnrollment = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT Status FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (existingEnrollment.recordset.length > 0) {
            res.status(400).json({ 
                message: "You are already enrolled in this program",
                enrollmentStatus: existingEnrollment.recordset[0].Status
            });
            return;
        }

        // Create new enrollment
        await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .input('RegistrationDate', sql.DateTime2, new Date())
            .input('Status', sql.NVarChar, 'registered')
            .input('SurveyBeforeCompleted', sql.Bit, 0)
            .input('SurveyAfterCompleted', sql.Bit, 0)
            .query(`
                INSERT INTO CommunityProgramAttendee 
                (ProgramID, AccountID, RegistrationDate, Status, SurveyBeforeCompleted, SurveyAfterCompleted)
                VALUES (@ProgramID, @AccountID, @RegistrationDate, @Status, @SurveyBeforeCompleted, @SurveyAfterCompleted)
            `);

        res.status(201).json({ 
            message: "Successfully enrolled in program",
            programId: programId,
            programName: programCheck.recordset[0].ProgramName,
            status: 'registered',
            isEnrolled: true,
            registrationDate: new Date().toISOString(),
            SurveyBeforeCompleted: false,
            SurveyAfterCompleted: false
        });
    } catch (err) {
        console.error("Enrollment error:", err);
        res.status(500).json({ message: "Server error during enrollment" });
    }
}

export async function unenrollFromProgram(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                DELETE FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
        }

        res.status(200).json({ 
            message: "Successfully unenrolled from program",
            programId: programId,
            isEnrolled: false,
            status: null,
            registrationDate: null,
            SurveyBeforeCompleted: false,
            SurveyAfterCompleted: false
        });
    } catch (err) {
        console.error("Unenrollment error:", err);
        res.status(500).json({ message: "Server error during unenrollment" });
    }
}

export async function getMyEnrolledPrograms(req: Request, res: Response): Promise<void> {
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT 
                    cp.ProgramID,
                    cp.ProgramName,
                    cp.Type,
                    cp.Date,
                    cp.Description,
                    cp.Organizer,
                    cp.Url,
                    cp.ImageUrl,
                    cpa.RegistrationDate,
                    cpa.Status,
                    cpa.SurveyBeforeCompleted,
                    cpa.SurveyAfterCompleted
                FROM CommunityProgram cp
                INNER JOIN CommunityProgramAttendee cpa ON cp.ProgramID = cpa.ProgramID
                WHERE cpa.AccountID = @AccountID AND cp.IsDisabled = 0
                ORDER BY cpa.RegistrationDate DESC
            `);

        res.json({
            data: result.recordset,
            total: result.recordset.length
        });
    } catch (err) {
        console.error("Get enrolled programs error:", err);
        res.status(500).json({ message: "Server error" });
    }
}