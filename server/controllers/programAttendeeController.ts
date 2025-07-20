import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

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
        res.status(500).json({ message: "Lỗi máy chủ" });
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
                    a.Email,
                    sr_before.ResponseData as BeforeSurveyData,
                    sr_before.CreatedAt as BeforeSurveyDate,
                    sr_after.ResponseData as AfterSurveyData,
                    sr_after.CreatedAt as AfterSurveyDate,
                    CASE WHEN sr_before.ResponseID IS NOT NULL THEN 1 ELSE 0 END as HasBeforeSurvey,
                    CASE WHEN sr_after.ResponseID IS NOT NULL THEN 1 ELSE 0 END as HasAfterSurvey
                FROM CommunityProgramAttendee cpa
                INNER JOIN CommunityProgram cp ON cpa.ProgramID = cp.ProgramID
                INNER JOIN Account a ON cpa.AccountID = a.AccountID
                LEFT JOIN SurveyResponse sr_before ON cpa.AccountID = sr_before.AccountID 
                    AND cpa.ProgramID = sr_before.ProgramID 
                    AND sr_before.SurveyType = 'before'
                LEFT JOIN SurveyResponse sr_after ON cpa.AccountID = sr_after.AccountID 
                    AND cpa.ProgramID = sr_after.ProgramID 
                    AND sr_after.SurveyType = 'after'
                WHERE cpa.ProgramID = @ProgramID
                ORDER BY cpa.RegistrationDate DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching attendees by program ID:', err);
        res.status(500).json({ message: "Lỗi máy chủ" });
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
        res.status(500).json({ message: "Lỗi máy chủ" });
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
        res.status(500).json({ message: "Lỗi máy chủ" });
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
        res.status(500).json({ message: "Lỗi máy chủ" });
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
        res.status(500).json({ message: "Lỗi máy chủ" + err, error: err });
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

        // Kiểm tra đăng ký tồn tại trước khi xóa
        const enrollmentCheck = await pool.request()
            .input('ProgramID', sql.Int, programId)
            .input('AccountID', sql.Int, accountId)
            .query(`
                SELECT * FROM CommunityProgramAttendee 
                WHERE ProgramID = @ProgramID AND AccountID = @AccountID
            `);

        if (enrollmentCheck.recordset.length === 0) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
        }

        // Bắt đầu transaction để đảm bảo tính nhất quán dữ liệu
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Xóa tất cả khảo sát đã làm cho chương trình này
            await transaction.request()
                .input('ProgramID', sql.Int, programId)
                .input('AccountID', sql.Int, accountId)
                .query(`
                    DELETE FROM SurveyResponse 
                    WHERE ProgramID = @ProgramID AND AccountID = @AccountID
                `);

            // Xóa bản ghi đăng ký
            await transaction.request()
                .input('ProgramID', sql.Int, programId)
                .input('AccountID', sql.Int, accountId)
                .query(`
                    DELETE FROM CommunityProgramAttendee 
                    WHERE ProgramID = @ProgramID AND AccountID = @AccountID
                `);

            // Commit transaction
            await transaction.commit();

            console.log(`Unenrolled user ${accountId} from program ${programId} and deleted survey responses`);
        } catch (transactionError) {
            // Rollback nếu có lỗi
            await transaction.rollback();
            throw transactionError;
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
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

/**
 * Thống kê số người tham gia từng chương trình theo từng tháng
 * @route GET /api/program-attendee/statistics/enroll
 * @access Chỉ Admin
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với danh sách chương trình, tháng và số người tham gia
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
 */
export async function getMonthlyProgramEnrollmentStatistics(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        // Truy vấn lấy số lượng người đăng ký từng chương trình theo từng tháng
        const result = await pool.request().query(`
            SELECT 
                cp.ProgramID,
                cp.ProgramName,
                YEAR(cpa.RegistrationDate) AS Year,
                MONTH(cpa.RegistrationDate) AS Month,
                COUNT(cpa.AccountID) AS EnrollCount
            FROM CommunityProgram cp
            LEFT JOIN CommunityProgramAttendee cpa ON cp.ProgramID = cpa.ProgramID
            WHERE cpa.RegistrationDate IS NOT NULL
            GROUP BY cp.ProgramID, cp.ProgramName, YEAR(cpa.RegistrationDate), MONTH(cpa.RegistrationDate)
            ORDER BY cp.ProgramID, Year, Month
        `);
        res.status(200).json({
            message: 'Thống kê số người tham gia từng chương trình theo tháng thành công',
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

// Thống kê tổng số người tham gia tất cả chương trình
export async function getTotalProgramAttendeeStatistic(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COUNT(*) AS TotalAttendee FROM CommunityProgramAttendee
        `);
        res.status(200).json({
            message: 'Thống kê tổng số người tham gia thành công',
            totalAttendee: result.recordset[0]?.TotalAttendee || 0
        });
    } catch (err: any) {
        console.error('Lỗi khi thống kê tổng số người tham gia:', err.message);
        res.status(500).json({
            message: 'Lỗi khi thống kê tổng số người tham gia',
            error: err.message
        });
    }
}

/**
 * So sánh số lượng đăng ký chương trình giữa tháng hiện tại và tháng trước
 * @route GET /api/program-attendee/statistics/compare-enroll
 * @access Chỉ Admin
 * @returns {Promise<void>} Phản hồi JSON với số lượng đăng ký tháng trước, tháng hiện tại và phần trăm thay đổi
 */
export async function compareProgramEnrollmentStatistics(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        // Lấy tháng và năm hiện tại
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // Tính tháng và năm trước
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        // Truy vấn số lượng đăng ký tháng trước
        const prevResult = await pool.request()
            .input('prevMonth', sql.Int, prevMonth)
            .input('prevYear', sql.Int, prevYear)
            .query(`
                SELECT COUNT(*) AS PrevEnrollCount
                FROM CommunityProgramAttendee
                WHERE MONTH(RegistrationDate) = @prevMonth AND YEAR(RegistrationDate) = @prevYear
            `);
        // Truy vấn số lượng đăng ký tháng hiện tại
        const currResult = await pool.request()
            .input('currMonth', sql.Int, currentMonth)
            .input('currYear', sql.Int, currentYear)
            .query(`
                SELECT COUNT(*) AS CurrEnrollCount
                FROM CommunityProgramAttendee
                WHERE MONTH(RegistrationDate) = @currMonth AND YEAR(RegistrationDate) = @currYear
            `);
        const prevCount = prevResult.recordset[0]?.PrevEnrollCount || 0;
        const currCount = currResult.recordset[0]?.CurrEnrollCount || 0;
        // Tính phần trăm thay đổi
        let percentChange: number;
        if (prevCount === 0 && currCount > 0) {
            percentChange = 100;
        } else if (prevCount === 0 && currCount === 0) {
            percentChange = 0;
        } else {
            percentChange = ((currCount - prevCount) / prevCount) * 100;
        }
        res.status(200).json({
            message: 'So sánh số lượng đăng ký chương trình giữa tháng hiện tại và tháng trước thành công',
            previousMonth: { year: prevYear, month: prevMonth, enrollCount: prevCount },
            currentMonth: { year: currentYear, month: currentMonth, enrollCount: currCount },
            percentChange
        });
    } catch (err: any) {
        console.error('Lỗi trong compareProgramEnrollmentStatistics:', err);
        res.status(500).json({
            message: 'Lỗi khi so sánh số lượng đăng ký chương trình',
            error: err.message
        });
    }
}