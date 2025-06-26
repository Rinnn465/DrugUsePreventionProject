import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

/**
 * Lấy tất cả người tham gia chương trình, kèm thông tin chương trình và tài khoản liên quan.
 *
 * @route GET /api/program-attendees
 * @access Quản trị viên (hoặc cấu hình tùy ý)
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Mảng JSON các người tham gia kèm thông tin chương trình và người dùng
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Lấy tổng số người tham gia của một chương trình cụ thể.
 *
 * @route GET /api/program-attendees/total/:programId
 * @access Công khai/Quản trị viên (tùy cấu hình)
 * @param {Request} req - Đối tượng request của Express, chứa programId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Đối tượng JSON với tổng số lượng
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Lấy thông tin một người tham gia cụ thể theo ProgramID và AccountID.
 * Có thể dùng để kiểm tra trạng thái đăng ký của người dùng với chương trình.
 *
 * @route GET /api/program-attendees/:programId/:accountId
 * @access Công khai/Quản trị viên (tùy cấu hình)
 * @param {Request} req - Đối tượng request của Express, chứa programId và accountId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Đối tượng JSON với thông tin người tham gia
 * @throws {404} Nếu không tìm thấy người tham gia
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Kiểm tra người dùng hiện tại đã đăng ký chương trình hay chưa.
 *
 * @route GET /api/program-attendees/enrollment-status/:programId
 * @access Người dùng đã xác thực
 * @param {Request} req - Đối tượng request của Express, chứa user và programId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Đối tượng JSON với trạng thái đăng ký và ngày đăng ký
 * @throws {401} Nếu chưa xác thực
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Đăng ký chương trình cho người dùng hiện tại.
 *
 * @route POST /api/program-attendees/enroll/:programId
 * @access Người dùng đã xác thực
 * @param {Request} req - Đối tượng request của Express, chứa user và programId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Đối tượng JSON xác nhận đăng ký
 * @throws {401} Nếu chưa xác thực
 * @throws {404} Nếu không tìm thấy chương trình hoặc chương trình đã bị vô hiệu hóa
 * @throws {400} Nếu đã đăng ký rồi
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Hủy đăng ký chương trình cho người dùng hiện tại.
 *
 * @route DELETE /api/program-attendees/unenroll/:programId
 * @access Người dùng đã xác thực
 * @param {Request} req - Đối tượng request của Express, chứa user và programId trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Đối tượng JSON xác nhận hủy đăng ký
 * @throws {401} Nếu chưa xác thực
 * @throws {404} Nếu không tìm thấy đăng ký
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Lấy tất cả chương trình mà người dùng hiện tại đã đăng ký.
 *
 * @route GET /api/program-attendees/my-programs
 * @access Người dùng đã xác thực
 * @param {Request} req - Đối tượng request của Express, chứa thông tin user
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Mảng JSON các chương trình đã đăng ký và tổng số lượng
 * @throws {401} Nếu chưa xác thực
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
