import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import e, { Request, Response } from 'express';

dotenv.config();

export async function getLesson(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(req.params);

    console.log(`Fetching lessons for course ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CourseId', Number(courseId))
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId');
        res.status(200).json({ message: 'Courses fetched successfully', data: result.recordset });

        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching courses', error: err.message });
        return;
    }
}

export async function getLessonContent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CourseId', Number(id))
            .query('SELECT * FROM LessonQuestion WHERE LessonID IN ( SELECT l.LessonID FROM Course c JOIN Lesson l ON c.CourseID = l.CourseID WHERE l.CourseID = @CourseId)');
        res.status(200).json({ message: 'Lesson content fetched successfully', data: result.recordset });

        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching lesson content', error: err.message });
        return;
    }
}

export async function getQuestions(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;

    console.log(`Fetching questions for lesson ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query('SELECT * FROM LessonQuestion WHERE LessonID IN ( SELECT l.LessonID FROM Course c JOIN Lesson l ON c.CourseID = l.CourseID WHERE l.CourseID = @CourseId)')

        res.status(200).json({ message: 'Lesson questions fetched successfully', data: result.recordset });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lesson questions', error: err.message });
    }
}

export async function getAnswers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(req.params);

    console.log(`Fetching answers for question ID: ${id}`);

    try {
        const pool = await poolPromise;
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

        res.status(200).json({ message: 'Lesson answers fetched successfully', data: result.recordset });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lesson answers', error: err.message });
    }
}