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
        // Get database connection
        const pool = await poolPromise;
        // Query all courses
        const result = await pool.request().query('SELECT * FROM Course');
        res.status(200).json({
            message: 'Courses fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in getCourses:', err);
        res.status(500).json({
            message: 'Error fetching courses',
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
