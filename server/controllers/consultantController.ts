import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { sql, poolPromise } from "../config/database";

dotenv.config();

/**
 * Interface representing a Consultant in the database
 * Maps to the Consultant table structure
 */
interface Consultant {
    ConsultantID: number;
    Name: string;
    Specialization: string;
    Experience: string;
    IsAvailable: boolean;
}

export async function getConsultants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
        SELECT c.AccountID ,c.Name, c.Bio, c.Title, c.ImageUrl, c.IsDisabled, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
        FROM Consultant c JOIN ConsultantSchedule cs ON c.AccountID = cs.AccountID 
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

/**
 * Retrieves all consultants from the database
 *
 * @route GET /api/consultants
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with array of consultants
 * @throws {500} If database error occurs
 */


export async function getConsultantWithCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                c.AccountID, 
                c.Name, 
                c.Bio, 
                c.Title, 
                c.ImageUrl, 
                c.IsDisabled,
                cc.CategoryID,
                cat.CategoryName
            FROM Consultant c 
            LEFT JOIN ConsultantCategory cc ON c.AccountID = cc.AccountID
            LEFT JOIN Category cat ON cc.CategoryID = cat.CategoryID
            WHERE (c.IsDisabled = 0 OR c.IsDisabled IS NULL)
            ORDER BY c.AccountID, cc.CategoryID
        `);


        // Group consultants by ID and collect their categories
        const consultantsMap = new Map();

        result.recordset.forEach(row => {
            const consultantId = row.AccountID;

            if (!consultantsMap.has(consultantId)) {
                consultantsMap.set(consultantId, {
                    AccountID: row.AccountID,
                    Name: row.Name,
                    Bio: row.Bio,
                    Title: row.Title,
                    ImageUrl: row.ImageUrl,
                    IsDisabled: row.IsDisabled || false,
                    Categories: []
                });
            }

            // Add category if it exists and is not already added
            if (row.CategoryID && row.CategoryName) {
                const consultant = consultantsMap.get(consultantId);
                const categoryExists = consultant.Categories.some(
                    (cat: any) => cat.CategoryID === row.CategoryID
                );

                if (!categoryExists) {
                    consultant.Categories.push({
                        CategoryID: row.CategoryID,
                        CategoryName: row.CategoryName
                    });
                }
            }
        });

        const groupedConsultants = Array.from(consultantsMap.values());
        groupedConsultants.map(c => ({
            name: c.Name,
            categories: c.Categories.map((cat: any) => cat.CategoryName)
        }));

        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: groupedConsultants,
        });
    } catch (err: any) {
        console.error('Error in getConsultants:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

/**
 * Retrieves a specific consultant by their ID
 *
 * @route GET /api/consultants/:id
 * @access Public
 * @param {Request} req - Express request object with consultant ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with consultant details
 * @throws {404} If consultant is not found
 * @throws {500} If server error occurs
 */
export async function getConsultantById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const consultantId = req.params.id;

    // Validate that consultantId is a valid number
    if (isNaN(Number(consultantId))) {
        res.status(400).json({ message: "Invalid consultant ID. Must be a number." });
        return;
    }

    try {
        // Query consultant with parameterized query for security
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("consultantId", sql.Int, consultantId)
            .query(`
                SELECT 
                    c.AccountID,
                    c.Name,
                    c.Bio,
                    c.Title,
                    c.ImageUrl,
                    c.IsDisabled
                FROM Consultant c 
                WHERE c.AccountID = @consultantId AND (c.IsDisabled = 0 OR c.IsDisabled IS NULL)
            `);

        // Check if consultant exists
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

/**
 * Retrieves all qualifications and their associated consultants
 * Uses a JOIN operation to get qualification-consultant relationships
 *
 * @route GET /api/consultants/qualifications
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with qualifications data
 * @throws {500} If database error occurs
 */
export async function getQualifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;

        // Join query to get qualifications with consultant associations
        const result = await pool.request().query(
            `SELECT q.QualificationID, q.Name, cq.AccountID  
               FROM Qualification q JOIN ConsultantQualification cq ON q.QualificationID = cq.QualificationID`
        );
        res
            .status(200)
            .json({ message: "Tải dữ liệu bằng cấp thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

/**
 * Retrieves all specialties and their associated consultants
 * Uses a JOIN operation to get specialty-consultant relationships
 *
 * @route GET /api/consultants/specialties
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with specialties data
 * @throws {500} If database error occurs
 */
export async function getSpecialties(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        // Join query to get specialties with consultant associations
        const result = await pool.request().query(
            `SELECT s.SpecialtyID, s.Name, cs.AccountID 
               FROM Specialty s JOIN ConsultantSpecialty cs ON s.SpecialtyID = cs.SpecialtyID`
        );
        res
            .status(200)
            .json({ message: "Tải dữ liệu chuyên môn thành công", data: result.recordset });
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

        let actualConsultantId = consultantId;

        try {
            const consultantCheck = await pool.request()
                .input('AccountID', sql.Int, consultantId)
                .query('SELECT AccountID FROM Consultant WHERE AccountID = @AccountID');


            if (consultantCheck.recordset.length > 0) {
                actualConsultantId = consultantCheck.recordset[0].AccountID;
            } else {
                console.log('No consultant found with AccountID, using original ID as ConsultantID');
            }
        } catch (accountCheckError) {
            console.log('Error checking AccountID, might not have AccountID column:', accountCheckError);
        }

        const result = await pool.request()
            .input('ConsultantID', sql.Int, actualConsultantId)
            .query('SELECT * FROM ConsultantSchedule WHERE AccountID = @ConsultantID');


        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching consultant schedule:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { scheduleId } = req.params;
    const { date, startTime, endTime } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ScheduleID', sql.Int, scheduleId)
            .input('Date', sql.Date, date)
            .input('StartTime', sql.Time, startTime)
            .input('EndTime', sql.Time, endTime)
            .query(`
                UPDATE ConsultantSchedule 
                SET Date = @Date, StartTime = @StartTime, EndTime = @EndTime
                WHERE ScheduleID = @ScheduleID
            `);

        res.status(200).json({ message: 'Cập nhật lịch làm việc thành công' });
    } catch (error) {
        console.error('Error updating consultant schedule:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật lịch làm việc' });
    }
}

/**
 * Delete consultant schedule
 */
export async function deleteConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { scheduleId } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ScheduleID', sql.Int, scheduleId)
            .query(`
                DELETE FROM ConsultantSchedule 
                WHERE ScheduleID = @ScheduleID
            `);

        res.status(200).json({ message: 'Xóa lịch làm việc thành công' });
    } catch (error) {
        console.error('Error deleting consultant schedule:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa lịch làm việc' });
    }
}

export async function addConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, date, startTime, endTime } = req.body;

    try {
        const pool = await poolPromise;
        const formattedStartTime = startTime.endsWith(':00') ? startTime : `${startTime}:00`;
        const formattedEndTime = endTime.endsWith(':00') ? endTime : `${endTime}:00`;
        // First, check if consultantId is actually an AccountID and get the ConsultantID

        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .input('Date', sql.Date, date)
            .input('StartTime', sql.NVarChar, formattedStartTime)
            .input('EndTime', sql.NVarChar, formattedEndTime)
            .query(`
                INSERT INTO ConsultantSchedule (AccountID, Date, StartTime, EndTime)
                VALUES (@ConsultantID, @Date, @StartTime, @EndTime)
            `);

        res.status(201).json({ message: 'Thêm lịch làm việc thành công' });
    } catch (error) {
        console.error('Error adding consultant schedule:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm lịch làm việc' });
    }
}

export async function getPendingAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    try {
        const pool = await poolPromise;


        // First, check if consultantId is actually an AccountID and get the ConsultantID
        let actualConsultantId = consultantId;

        // Try to find consultant by AccountID first
        const consultantCheck = await pool.request()
            .input('AccountID', sql.Int, consultantId)
            .query('SELECT AccountID FROM Consultant WHERE AccountID = @AccountID');


        if (consultantCheck.recordset.length > 0) {
            actualConsultantId = consultantCheck.recordset[0].AccountID;
        } else {
            console.log('No consultant found with AccountID, using original ID as ConsultantID');
        }

        const result = await pool.request()
            .input('ConsultantID', sql.Int, actualConsultantId)
            .query(`
                SELECT 
                    a.*,
                    acc.FullName as CustomerName,
                    acc.Email as CustomerEmail
                FROM Appointment a
                LEFT JOIN Account acc ON a.AccountID = acc.AccountID
                WHERE a.ConsultantID = @ConsultantID 
                AND a.Status = 'pending'
                ORDER BY a.Date ASC, a.Time ASC
            `);


        res.status(200).json({
            message: 'Lấy danh sách cuộc hẹn chờ duyệt thành công',
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching pending appointments:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách cuộc hẹn' });
    }
}

export async function getConsulantCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .query(`
                SELECT c.AccountID, cc.CategoryID, cat.CategoryName
                FROM Consultant c
                JOIN ConsultantCategory cc ON c.AccountID = cc.AccountID
				JOIN Category cat ON cat.CategoryID = cc.CategoryID
                WHERE c.AccountID = @ConsultantID
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching consultant category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getTodayAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }

    try {
        const pool = await poolPromise;

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .input('TodayDate', sql.Date, todayString)
            .query(`
                SELECT 
                    a.AppointmentID,
                    a.ConsultantID,
                    a.AccountID,
                    a.Time,
                    a.Date,
                    a.Status,
                    a.Description,
                    a.Duration,
                    acc.FullName as CustomerName,
                    acc.Email as CustomerEmail
                FROM Appointment a
                LEFT JOIN Account acc ON a.AccountID = acc.AccountID
                WHERE a.ConsultantID = @ConsultantID 
                    AND CAST(a.Date AS DATE) = CAST(@TodayDate AS DATE)
                    AND a.Status IN ('confirmed')
                ORDER BY a.Time ASC
            `);


        res.status(200).json({
            message: 'Lấy danh sách cuộc hẹn hôm nay thành công',
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching today appointments:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách cuộc hẹn hôm nay' });
    }
}

export async function getWeekAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId, week } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }
    try {
        const pool = await poolPromise;

        //get first and last day of the week
        const firstDayOfWeek = new Date(week);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);


        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .input('FirstDay', sql.DateTime, firstDayOfWeek)
            .input('LastDay', sql.DateTime, lastDayOfWeek)
            .query(`
                SELECT 
                    a.AppointmentID,
                    a.ConsultantID,
                    a.AccountID,
                    a.Time,
                    a.Date,
                    a.Status,
                    a.Description,
                    a.Duration,
                    a.Rating,
                    a.Feedback,
                    acc.FullName as CustomerName,
                    acc.Email as CustomerEmail
                FROM Appointment a
                LEFT JOIN Account acc ON a.AccountID = acc.AccountID
                WHERE a.ConsultantID = @ConsultantID 
                    AND a.Date >= @FirstDay 
                    AND a.Date <= @LastDay
                    AND a.Status IN ('confirmed')
                ORDER BY a.Date ASC, a.Time ASC
            `);

        res.status(200).json({
            message: 'Lấy danh sách cuộc hẹn trong tuần thành công',
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching this month appointments:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách cuộc hẹn trong tuần' });
    }
}

export async function compareAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }

    try {
        const pool = await poolPromise;

        // Query for appointments in the last month
        const lastMonthAppointments = await pool.request()
            .query(`
                SELECT 
                    COUNT(*) AS appointment_count,
                CASE 
                    WHEN DATEADD(MONTH, DATEDIFF(MONTH, 0, Date), 0) = DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) THEN 'This Month'
                    WHEN DATEADD(MONTH, DATEDIFF(MONTH, 0, Date), 0) = DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) THEN 'Last Month'
                END AS month_period
                FROM Appointment
                WHERE Date >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0)
                    AND Date < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)
                GROUP BY DATEADD(MONTH, DATEDIFF(MONTH, 0, Date), 0)
                ORDER BY month_period DESC
            `);
        res.status(200).json({
            message: 'So sánh cuộc hẹn thành công',
            data: {
                lastMonthAppointments: lastMonthAppointments.recordset.filter(row => row.month_period === 'Last Month')[0]?.appointment_count || 0,
                thisMonthAppointments: lastMonthAppointments.recordset.filter(row => row.month_period === 'This Month')[0]?.appointment_count || 0
            }
        });
    } catch (error) {
        console.error('Error comparing appointments:', error);
        res.status(500).json({ message: 'Lỗi server khi so sánh cuộc hẹn' });
    }
}

export async function getAverageRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }

    try {
        const pool = await poolPromise;

        // Query to get average rating for the consultant
        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .query(`
                SELECT AVG(Rating) AS averageRating
                FROM Appointment
                WHERE ConsultantID = @ConsultantID
            `);

        const averageRating = result.recordset[0]?.averageRating || 0;

        res.status(200).json({
            message: 'Lấy đánh giá trung bình thành công',
            data: { averageRating }
        });
    } catch (error) {
        console.error('Error getting average rating:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy đánh giá trung bình' });
    }

}