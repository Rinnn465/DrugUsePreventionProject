import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

/**
 * Retrieves all program attendees with joined program and account details.
 *
 * @route GET /api/program-attendees
 * @access Admin (or as configured)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON array of attendees with program and user info
 * @throws {500} If database error occurs
 */
export async function getAllProgramAttendees(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        // Query all attendees with program and account info
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

/**
 * Retrieves the total number of attendees for a given program.
 *
 * @route GET /api/program-attendees/total/:programId
 * @access Public/Admin (as configured)
 * @param {Request} req - Express request object with programId param
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON object with total count
 * @throws {500} If database error occurs
 */
export async function getTotalAttendeesByProgramId(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    try {
        const pool = await poolPromise;
        // Count attendees for the given program
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

/**
 * Retrieves a specific attendee by ProgramID and AccountID.
 * Can also be used to check enrollment status for a user in a program.
 *
 * @route GET /api/program-attendees/:programId/:accountId
 * @access Public/Admin (as configured)
 * @param {Request} req - Express request object with programId and accountId params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON object with attendee details
 * @throws {404} If attendee not found
 * @throws {500} If database error occurs
 */
export async function getAttendeeById(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = Number(req.params.accountId);
    try {
        const pool = await poolPromise;
        // Query for attendee by program and account ID
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

/**
 * Checks if the current authenticated user is enrolled in a specific program.
 *
 * @route GET /api/program-attendees/enrollment-status/:programId
 * @access Authenticated users
 * @param {Request} req - Express request object with user and programId param
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON object with enrollment status and registration date
 * @throws {401} If user is not authenticated
 * @throws {500} If database error occurs
 */
export async function checkEnrollmentStatus(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Query for enrollment status
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT Status, RegistrationDate 
                FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (result.recordset.length === 0) {
            res.json({ 
                isEnrolled: false,
                status: null,
                registrationDate: null
            });
            return;
        }

        const enrollment = result.recordset[0];
        res.json({
            isEnrolled: true,
            status: enrollment.Status,
            registrationDate: enrollment.RegistrationDate
        });

    } catch (err) {
        console.error("Check enrollment status error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * Enrolls the current authenticated user into a community program.
 *
 * @route POST /api/program-attendees/enroll/:programId
 * @access Authenticated users
 * @param {Request} req - Express request object with user and programId param
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON object with enrollment confirmation
 * @throws {401} If user is not authenticated
 * @throws {404} If program not found or disabled
 * @throws {400} If already enrolled
 * @throws {500} If database error occurs
 */
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
            .query(`
                INSERT INTO CommunityProgramAttendee 
                (ProgramID, AccountID, RegistrationDate, Status)
                VALUES (@ProgramID, @AccountID, @RegistrationDate, @Status)
            `);

        res.status(201).json({ 
            message: "Successfully enrolled in program",
            programId: programId,
            programName: programCheck.recordset[0].ProgramName,
            status: 'registered'
        });

    } catch (err) {
        console.error("Enrollment error:", err);
        res.status(500).json({ message: "Server error during enrollment" });
    }
}

/**
 * Unenrolls the current authenticated user from a community program.
 *
 * @route DELETE /api/program-attendees/unenroll/:programId
 * @access Authenticated users
 * @param {Request} req - Express request object with user and programId param
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON object with unenrollment confirmation
 * @throws {401} If user is not authenticated
 * @throws {404} If enrollment not found
 * @throws {500} If database error occurs
 */
export async function unenrollFromProgram(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;

        // Delete enrollment for user and program
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
            programId: programId
        });

    } catch (err) {
        console.error("Unenrollment error:", err);
        res.status(500).json({ message: "Server error during unenrollment" });
    }
}

/**
 * Retrieves all programs that the current authenticated user is enrolled in.
 *
 * @route GET /api/program-attendees/my-programs
 * @access Authenticated users
 * @param {Request} req - Express request object with user info
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON array of enrolled programs and total count
 * @throws {401} If user is not authenticated
 * @throws {500} If database error occurs
 */
export async function getMyEnrolledPrograms(req: Request, res: Response): Promise<void> {
    const accountId = (req as any).user?.user?.AccountID;

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const pool = await poolPromise;

        // Query all programs the user is enrolled in
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
                    cp.Location,
                    cp.Url,
                    cp.ImageUrl,
                    cpa.RegistrationDate,
                    cpa.Status
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
