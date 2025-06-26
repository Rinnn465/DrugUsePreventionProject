import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import { Request, Response } from 'express';

dotenv.config();
/**
 * Retrieves all active courses from the database
 * 
 * @route GET /api/courses
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of courses
 * @throws {500} If database error occurs
 */
export async function getCourses(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;

        // Use JSON aggregation to group categories
        const result = await pool.request().query(`
            SELECT 
                c.CourseID, 
                c.CourseName, 
                c.Risk, 
                c.Description, 
                c.ImageUrl, 
                c.EnrollCount,
                c.Duration,
                c.IsDisabled,
                c.Status,
                (
                    SELECT cc.CategoryID, cate.CategoryName
                    FROM CourseCategory cc
                    JOIN Category cate ON cate.CategoryID = cc.CategoryID
                    WHERE cc.CourseID = c.CourseID
                    FOR JSON PATH
                ) AS CategoryJSON
            FROM Course c
            WHERE c.IsDisabled = 0
        `);

        console.log('Raw query result:', result.recordset); // Debug log

        // Parse the JSON categories properly
        const courses = result.recordset.map(course => {
            let categories = [];

            // Handle the CategoryJSON parsing
            if (course.CategoryJSON) {
                try {
                    // Parse the JSON string
                    categories = JSON.parse(course.CategoryJSON);
                    console.log('Parsed categories for course', course.CourseID, ':', categories);
                } catch (parseError) {
                    console.error('Error parsing CategoryJSON for course', course.CourseID, ':', parseError);
                    categories = [];
                }
            }

            // Return course with properly parsed categories
            return {
                CourseID: course.CourseID,
                CourseName: course.CourseName,
                Risk: course.Risk,
                Description: course.Description,
                ImageUrl: course.ImageUrl,
                EnrollCount: course.EnrollCount,
                Duration: course.Duration,
                IsDisabled: course.IsDisabled,
                Status: course.Status,
                Category: categories // This should now be an array
            };
        });

        console.log('Final processed courses:', JSON.stringify(courses, null, 2)); // Debug log

        res.status(200).json({
            message: 'Courses fetched successfully',
            data: courses
        });
        return;
    } catch (err: any) {
        console.error('Error in getCourses:', err);
        res.status(500).json({
            message: 'Error fetching courses',
            error: err.message
        });
        return;
    }
}

/**
 * Retrieves all course categories from the database
 * 
 * @route GET /api/courses/category
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of course categories
 * @throws {500} If database error occurs
 */
export async function getCourseCategories(req: Request, res: Response): Promise<void> {
    try {
        // Get database connection
        const pool = await poolPromise;
        // Query all course categories
        const result = await pool.request().query('SELECT * FROM Category');
        res.status(200).json({
            message: 'Course categories fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in getCourseCategories:', err);
        res.status(500).json({
            message: 'Error fetching course categories',
            error: err.message
        });
        return;
    }
}


/**
 * Retrieves a specific course by its ID
 * 
 * @route GET /api/courses/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with course details
 * @throws {404} If course is not found
 * @throws {500} If server error occurs
 */
export async function getCourseById(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        // Get database connection
        const pool = await poolPromise;
        // Query specific course with parameterized query for security
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Course WHERE CourseID = @courseId');

        // Check if course exists
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        // Return course data
        res.status(200).json({
            message: 'Course fetched successfully',
            data: result.recordset[0]
        });
        return;
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in getCourseById:', err);
        res.status(500).json({
            message: 'Error fetching course',
            error: err.message
        });
        return;
    }
}

export async function enrollCourse(req: Request, res: Response): Promise<void> {
    const { courseId, accountId, enrollmentDate, status } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .input('EnrollmentDate', sql.DateTime, enrollmentDate)
            .input('Status', sql.VarChar(50), status)
            .query('INSERT INTO Enrollment (CourseID, AccountID, EnrollmentDate, Status) VALUES (@CourseId, @AccountId, @EnrollmentDate, @Status)');

        res.status(201).json({ message: 'Enrollment successful', data: { courseId, accountId, enrollmentDate, status } });
        return;
    } catch (err: any) {
        console.error('Error in enrollCourse:', err);
        res.status(500).json({ message: 'Cõ lối trong quá trình xử lý', error: err.message });
        return;
    }
}

/**
 * Retrieves all courses that the user is enrolled in
 * 
 * @route GET /api/courses/enrolled
 * @access Private
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with enrolled courses
 * @throws {500} If database error occurs
 */
export async function getEnrolledCourses(req: Request, res: Response): Promise<void> {
    const accountId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('AccountId', sql.Int, accountId)
            .query(
                `SELECT e.EnrollmentID, e.CourseID, e.AccountID, e.CompletedDate, e.Status, c.CourseName, c.Description, c.ImageUrl, c.IsDisabled 
                FROM Enrollment e JOIN Course c ON e.CourseID = c.CourseID
                WHERE AccountID = @AccountID AND c.IsDisabled = 0
                `
            );

        res.status(200).json({
            message: 'Enrolled courses fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Error in getEnrolledCourses:', err);
        res.status(500).json({
            message: 'Error fetching enrolled courses',
            error: err.message
        });
        return;
    }
}

export async function completeCourse(req: Request, res: Response): Promise<void> {
    const { courseId, accountId, completedDate } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .input('CompletedDate', sql.DateTime, completedDate)
            .query(`UPDATE Enrollment SET Status = \'Completed\',
                    SET CompletedDate = @CompletedDate
                  WHERE CourseID = @CourseId AND AccountID = @AccountId`);
        res.status(200).json({ message: 'Hoàn thành khóa học' });
        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Cõ lối trong quá trình xử lý', error: err.message });
        return;
    }
}

export async function getCompletedCourseById(req: Request, res: Response): Promise<void> {
    const { courseId, accountId } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CourseId', sql.Int, courseId)
            .input('AccountId', sql.Int, accountId)
            .query('SELECT * FROM Enrollment WHERE CourseID = @CourseId AND AccountID = @AccountId AND Status = \'Completed\'');

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Enrollment not found' });
            return;
        }

        res.status(200).json({
            message: 'Course progress fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Error in getCourseProgress:', err);
        res.status(500).json({
            message: 'Error fetching course progress',
            error: err.message
        });
        return;
    }
}