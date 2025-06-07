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
            .input('CourseId', courseId)
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId');
        res.status(200).json({ message: 'Courses fetched successfully', data: result.recordset });

        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching courses', error: err.message });
        return;
    }
}

export async function getLessonContent(req: Request, res: Response): Promise<void> {
    const { lessonId, id } = req.params;
    console.log(`Fetching content for lesson ID: ${lessonId} in course ID: ${id}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LessonId', lessonId) // <-- bind the variable here
            .input('CourseId', id)
            .query('SELECT * FROM Lesson WHERE LessonID = @LessonId AND CourseID = @CourseId');
        res.status(200).json({ message: 'Lesson content fetched successfully', data: result.recordset });

        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching lesson content', error: err.message });
        return;
    }
}

export async function getQuestions(req: Request, res: Response): Promise<void> {
    const { lessonId } = req.params;
    console.log(`Fetching questions for lesson ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LessonID', lessonId)
            .query('SELECT * FROM LessonQuestion WHERE QuestionId = @LessonID')

        res.status(200).json({ message: 'Lesson questions fetched successfully', data: result.recordset });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lesson questions', error: err.message });
    }
}

export async function getAnswers(req: Request, res: Response): Promise<void> {
    const { lessonId } = req.params;
    console.log(req.params);

    console.log(`Fetching answers for question ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LessonID', lessonId)
            .query('select la.AnswerID, la.QuestionID, la.AnswerText, la.IsCorrect, la.IsDisabled from LessonQuestion lq JOIN LessonAnswer la ON lq.QuestionId = la.QuestionId where lessonId = @LessonID')

        res.status(200).json({ message: 'Lesson answers fetched successfully', data: result.recordset });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lesson answers', error: err.message });
    }
}