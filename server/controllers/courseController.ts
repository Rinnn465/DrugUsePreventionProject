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

/** 
 * Creates a new course in the database
 * @route POST /api/courses
 * @access Admin
 * @param {Request} req - Express request object with course data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created course details
 * @throws {400} If course data is invalid
 * @throws {500} If server error occurs
 * */
export async function createCourse(req: Request, res: Response): Promise<void> {
    const { CourseName, Description, ImageUrl, IsDisabled } = req.body;

    // Validate required fields
    if (!CourseName || !Description) {
        res.status(400).json({ message: 'Course name and description are required' });
        return;
    }

    try {
        // Get database connection
        const pool = await poolPromise;
        // Insert new course into database
        const result = await pool.request()
            .input('CourseName', sql.NVarChar, CourseName)
            .input('Description', sql.NVarChar, Description)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled || false)
            .query(`
                INSERT INTO Course (CourseName, Description, ImageUrl, IsDisabled)
                VALUES (@CourseName, @Description, @ImageUrl, @IsDisabled);
                SELECT SCOPE_IDENTITY() AS CourseID;
            `);

        // Return created course ID
        res.status(201).json({
            message: 'Course created successfully',
            data: { CourseID: result.recordset[0].CourseID }
        });
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in createCourse:', err);
        res.status(500).json({
            message: 'Error creating course',
            error: err.message
        });
    }
}

/**
 * Updates an existing course by its ID
 * 
 * @route PUT /api/courses/:id
 * @access Admin
 * @param {Request} req - Express request object with course ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated course details
 * @throws {400} If course data is invalid
 * @throws {404} If course is not found
 * @throws {500} If server error occurs
 */
export async function updateCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    const { CourseName, Description, ImageUrl, IsDisabled } = req.body;

    // Validate required fields
    if (!CourseName || !Description) {
        res.status(400).json({ message: 'Course name and description are required' });
        return;
    }

    try {
        // Get database connection
        const pool = await poolPromise;
        // Update course in database
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('CourseName', sql.NVarChar, CourseName)
            .input('Description', sql.NVarChar, Description)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled || false)
            .query(`
                UPDATE Course
                SET CourseName = @CourseName,
                    Description = @Description,
                    ImageUrl = @ImageUrl,
                    IsDisabled = @IsDisabled
                WHERE CourseID = @CourseID;
                SELECT * FROM Course WHERE CourseID = @CourseID;
            `);

        // Check if course was updated
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        // Return updated course data
        res.status(200).json({
            message: 'Course updated successfully',
            data: result.recordset[0]
        });
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in updateCourse:', err);
        res.status(500).json({
            message: 'Error updating course',
            error: err.message
        });
    }
}

/**
 * Deletes a course by its ID
 * 
 * @route DELETE /api/courses/:id
 * @access Admin
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 * @throws {404} If course is not found
 * @throws {500} If server error occurs
 */
export async function deleteCourse(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        // Get database connection
        const pool = await poolPromise;
        // Delete course from database
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .query('DELETE FROM Course WHERE CourseID = @CourseID');

        // Check if course was deleted
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        // Return success message
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err: any) {
        // Log error and send error response
        console.error('Error in deleteCourse:', err);
        res.status(500).json({
            message: 'Error deleting course',
            error: err.message
        });
    }
}