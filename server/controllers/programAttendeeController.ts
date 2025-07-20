import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';
import { sendEmail } from './mailController';
import { programInvitationTemplate } from '../templates/programInvitation';

/**
 * Lấy danh sách tất cả người tham gia các chương trình
 * @route GET /api/program-attendee
 * @access Chỉ Admin, Staff, Manager
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách người tham gia
 */
export async function getAllProgramAttendees(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới database
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
        res.json(result.recordset); // Trả về danh sách người tham gia
    } catch (err) {
        console.error('Error fetching all program attendees:', err);
        res.status(500).json({ message: "Server error" });
    }
}

// Get attendees by specific ProgramID
export async function getAttendeesByProgramId(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT 
                    cpa.*,
                    cp.ProgramName,
                    a.Username,
                    a.FullName,
                    a.Email
                FROM CommunityProgramAttendee cpa
                INNER JOIN CommunityProgram cp ON cpa.ProgramID = cp.ProgramID
                INNER JOIN Account a ON cpa.AccountID = a.AccountID
                WHERE cpa.ProgramID = @ProgramID
                ORDER BY cpa.RegistrationDate DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching attendees by program ID:', err);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * Lấy tổng số người tham gia theo ProgramID
 * @route GET /api/program-attendee/total/:programId
 * @access Chỉ Admin, Staff, Manager
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với tổng số người tham gia
 */
export async function getTotalAttendeesByProgramId(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId); // Ép kiểu tham số
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT COUNT(*) AS total
                FROM CommunityProgramAttendee
                WHERE ProgramID = @ProgramID
            `);
        res.json({ total: result.recordset[0].total }); // Trả về tổng số
    } catch (err) {
        console.error('Error fetching total attendees by program ID:', err);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * Lấy thông tin người tham gia theo ProgramID và AccountID
 * @route GET /api/program-attendee/:programId/:accountId
 * @access Chỉ Admin, Staff, Manager
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông tin người tham gia
 */
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
            res.status(404).json({ message: "Attendee not found" }); // Không tìm thấy
            return;
        }
        res.json(attendee); // Trả về thông tin người tham gia
    } catch (err) {
        console.error('Error fetching attendee by ID:', err);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * Kiểm tra trạng thái đăng ký chương trình của người dùng hiện tại
 * @route GET /api/program-attendee/:programId/check-enrollment
 * @access Member
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với trạng thái đăng ký
 */
export async function checkEnrollmentStatus(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    const accountId = (req as any).user?.user?.AccountID; // Lấy AccountID từ token

    if (!accountId) {
        res.status(401).json({ message: "Authentication required" }); // Chưa đăng nhập
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

/**
 * Đăng ký tham gia chương trình cho người dùng hiện tại
 * @route POST /api/program-attendee/:programId/enroll
 * @access Member
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả đăng ký
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

        // Kiểm tra chương trình tồn tại và đang hoạt động
        const programCheck = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT ProgramID, ProgramName, Status FROM CommunityProgram 
                WHERE ProgramID = @ProgramID AND IsDisabled = 0
            `);

        if (programCheck.recordset.length === 0) {
            res.status(404).json({ message: "Program not found or is disabled" });
            return;
        }

        // Chỉ cho phép đăng ký nếu chương trình chưa hoàn thành
        const program = programCheck.recordset[0];
        if (program.Status === 'completed') {
            res.status(400).json({
                message: "Cannot enroll in a completed program",
                programStatus: program.Status
            });
            return;
        }

        // Kiểm tra đã đăng ký chưa
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

        // Tạo mới bản ghi đăng ký
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
            programId: programId,
            programName: programCheck.recordset[0].ProgramName,
            status: 'registered',
            isEnrolled: true,
            registrationDate: new Date().toISOString(),
            SurveyBeforeCompleted: false,
            SurveyAfterCompleted: false
        });
    } catch (err: any) {
        console.log("Enrollment error:", err); // Log lỗi
        res.status(500).json({ message: "Server error during enrollment" + err, error: err });
    }
}

/**
 * Hủy đăng ký chương trình cho người dùng hiện tại
 * @route DELETE /api/program-attendee/:programId/unenroll
 * @access Member
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với kết quả hủy đăng ký
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

        // Kiểm tra chương trình tồn tại và trạng thái
        const programCheck = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT ProgramID, ProgramName, Status FROM CommunityProgram 
                WHERE ProgramID = @ProgramID AND IsDisabled = 0
            `);

        if (programCheck.recordset.length === 0) {
            res.status(404).json({ message: "Program not found or is disabled" });
            return;
        }

        // Chỉ cho phép hủy nếu chương trình chưa hoàn thành
        const program = programCheck.recordset[0];
        if (program.Status === 'completed') {
            res.status(400).json({
                message: "Cannot unenroll from a completed program",
                programStatus: program.Status
            });
            return;
        }

        const result = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                DELETE FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Enrollment not found" }); // Không tìm thấy bản ghi
            return;
        }

        res.status(200).json({
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

/**
 * Lấy danh sách chương trình mà người dùng hiện tại đã đăng ký
 * @route GET /api/program-attendee/my-programs
 * @access Member
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách chương trình đã đăng ký
 */
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

/**
 * Thống kê số người tham gia từng chương trình
 * @route GET /api/program-attendee/statistics/enroll
 * @access Chỉ Admin
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách chương trình và số người tham gia
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getProgramEnrollmentStatistics(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Kết nối tới pool của database
        // Truy vấn lấy số lượng người đăng ký từng chương trình
        const result = await pool.request().query(`
            SELECT 
                cp.ProgramID,
                cp.ProgramName,
                COUNT(cpa.AccountID) AS EnrollCount
            FROM CommunityProgram cp
            LEFT JOIN CommunityProgramAttendee cpa ON cp.ProgramID = cpa.ProgramID
            GROUP BY cp.ProgramID, cp.ProgramName
            ORDER BY EnrollCount DESC
        `);
        // Trả về kết quả thống kê
        res.status(200).json({
            message: 'Thống kê số người tham gia từng chương trình thành công',
            data: result.recordset
        });
    } catch (err: any) {
        // Nếu có lỗi, trả về lỗi 500
        console.error('Lỗi trong getProgramEnrollmentStatistics:', err);
        res.status(500).json({
            message: 'Lỗi khi thống kê số người tham gia chương trình',
            error: err.message
        });
    }
}

/**
 * Gửi lời mời Zoom cho tất cả người tham gia một chương trình
 * @route POST /api/program-attendee/send-invite/:programId
 * @access Chỉ Admin
 * @param {Request} req - Request object chứa programId
 * @param {Response} res - Response object
 * @returns {Promise<void>} Phản hồi JSON với kết quả gửi email
 */
export async function sendProgramInvitation(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.programId);
    
    try {
        const pool = await poolPromise;
        
        // Lấy thông tin chương trình
        const programResult = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT 
                    ProgramName,
                    [Date] as ProgramDate,
                    Organizer,
                    MeetingRoomName,
                    Status
                FROM CommunityProgram 
                WHERE ProgramID = @ProgramID AND IsDisabled = 0
            `);

        if (programResult.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy chương trình hoặc chương trình đã bị vô hiệu hóa" });
            return;
        }

        const program = programResult.recordset[0];

        // Kiểm tra chương trình đã có Zoom meeting chưa
        if (!program.MeetingRoomName) {
            res.status(400).json({ 
                message: "Chương trình chưa có thông tin Zoom meeting. Vui lòng tạo Zoom meeting trước khi gửi lời mời." 
            });
            return;
        }

        // Lấy danh sách người tham gia với email
        const attendeesResult = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .query(`
                SELECT 
                    cpa.AccountID,
                    a.FullName,
                    a.Username,
                    a.Email,
                    cpa.RegistrationDate
                FROM CommunityProgramAttendee cpa
                INNER JOIN Account a ON cpa.AccountID = a.AccountID
                WHERE cpa.ProgramID = @ProgramID
                    AND a.Email IS NOT NULL 
                    AND a.Email != ''
                    AND a.IsDisabled = 0
            `);

        const attendees = attendeesResult.recordset;

        if (attendees.length === 0) {
            res.status(404).json({ 
                message: "Không tìm thấy người tham gia nào có email hợp lệ cho chương trình này" 
            });
            return;
        }

        // Format ngày giờ
        const programDate = new Date(program.ProgramDate);
        const formattedDate = programDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = programDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Gửi email cho từng người tham gia
        const emailPromises = attendees.map(async (attendee) => {
            try {
                // Tạo Zoom join URL từ meeting ID
                const zoomJoinUrl = `https://zoom.us/j/${program.MeetingRoomName}`;
                
                const emailData = {
                    recipientName: attendee.FullName || attendee.Username,
                    programName: program.ProgramName,
                    programDate: formattedDate,
                    programTime: formattedTime,
                    zoomLink: zoomJoinUrl,
                    zoomMeetingId: program.MeetingRoomName || 'Chưa có ID',
                    zoomPasscode: 'Không yêu cầu mật khẩu',
                    organizerName: program.Organizer || 'Ban tổ chức'
                };

                const emailContent = programInvitationTemplate(emailData);
                
                await sendEmail(
                    attendee.Email,
                    `🎯 Lời mời tham gia: ${program.ProgramName}`,
                    emailContent
                );

                return { 
                    success: true, 
                    email: attendee.Email, 
                    name: attendee.FullName || attendee.Username
                };
            } catch (error) {
                console.error(`Lỗi gửi email cho ${attendee.Email}:`, error);
                return { 
                    success: false, 
                    email: attendee.Email, 
                    name: attendee.FullName || attendee.Username,
                    error: error instanceof Error ? error.message : 'Lỗi không xác định'
                };
            }
        });

        // Chờ tất cả email được gửi
        const results = await Promise.all(emailPromises);
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        const failedEmails = results.filter(r => !r.success);
        
        res.status(200).json({
            message: `Đã gửi lời mời thành công cho ${successCount}/${attendees.length} người tham gia`,
            summary: {
                total: attendees.length,
                success: successCount,
                failed: failCount,
                programName: program.ProgramName,
                programStatus: program.Status
            },
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined
        });

    } catch (err) {
        console.error('Lỗi trong sendProgramInvitation:', err);
        res.status(500).json({ 
            message: "Lỗi máy chủ khi gửi lời mời",
            error: err instanceof Error ? err.message : 'Lỗi không xác định'
        });
    }
}

