import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import e, { Request, Response } from 'express';

dotenv.config();

/**
 * Interface representing a Lesson in the database
 */
interface Lesson {
    LessonID: number;      // Unique identifier for the lesson
    CourseID: number;      // Reference to parent course
    Title: string;         // Lesson title
    Content: string;       // Lesson content/material
    Order: number;         // Lesson sequence in course
    Duration: number;      // Expected completion time
    IsActive: boolean;     // Lesson availability status
}

/**
 * Interface representing a Lesson Question
 */
interface LessonQuestion {
    QuestionID: number;    // Unique identifier for the question
    LessonID: number;      // Reference to parent lesson
    QuestionText: string;  // The actual question
    QuestionType: string;  // Type of question (e.g., multiple choice, true/false)
    Points: number;        // Points awarded for correct answer
}

/**
 * Retrieves all lessons for a specific course
 * 
 * @route GET /api/lessons/course/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of lessons
 * @throws {500} If database error occurs
 */
export async function getLesson(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Fetching lessons for course ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Query lessons with parameterized query for security
        const result = await pool.request()
            .input('CourseId', Number(courseId))
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId');
        res.status(200).json({ 
            message: 'Courses fetched successfully', 
            data: result.recordset 
        });
        return;
    } catch (err: any) {
        console.error('Error in getLesson:', err);
        res.status(500).json({ 
            message: 'Error fetching courses', 
            error: err.message 
        });
        return;
    }
}

/**
 * Retrieves lesson content including questions for a specific course
 * 
 * @route GET /api/lessons/content/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson content and questions
 * @throws {500} If database error occurs
 */
export async function getLessonContent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        // Complex query joining lessons and questions
        const result = await pool.request()
            .input('CourseId', Number(id))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);
        res.status(200).json({ 
            message: 'Lesson content fetched successfully', 
            data: result.recordset 
        });
        return;
    } catch (err: any) {
        console.error('Error in getLessonContent:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson content', 
            error: err.message 
        });
        return;
    }
}

/**
 * Retrieves all questions for a specific lesson
 * 
 * @route GET /api/lessons/questions/:id
 * @access Public
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson questions
 * @throws {500} If database error occurs
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Fetching questions for lesson ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Query questions for specific lesson
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);

        res.status(200).json({ 
            message: 'Lesson questions fetched successfully', 
            data: result.recordset 
        });
    } catch (err: any) {
        console.error('Error in getQuestions:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson questions', 
            error: err.message 
        });
    }
}

/**
 * Retrieves all answers for questions in a specific course
 * 
 * @route GET /api/lessons/answers/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson answers
 * @throws {500} If database error occurs
 */
export async function getAnswers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`Fetching answers for question ID: ${id}`);

    try {
        const pool = await poolPromise;
        // Complex query to get answers for all questions in a course
        const result = await pool.request()
            .input('CourseID', id)
            .query(`
            SELECT * 
            FROM LessonAnswer 
            WHERE QuestionID IN (
                SELECT lq.QuestionID 
                FROM Lesson l
                JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                WHERE l.CourseID = @CourseID
            );`);

        res.status(200).json({ 
            message: 'Lesson answers fetched successfully', 
            data: result.recordset 
        });
    } catch (err: any) {
        console.error('Error in getAnswers:', err);
        res.status(500).json({ 
            message: 'Error fetching lesson answers', 
            error: err.message 
        });
    }
}