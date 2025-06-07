import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import { Request, Response } from 'express';

dotenv.config();

export async function getCourses(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Course');
        res.status(200).json({ message: 'Courses fetched successfully', data: result.recordset });

        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching courses', error: err.message });
        return;
    }
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Course WHERE CourseID = @courseId');

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        res.status(200).json({ message: 'Course fetched successfully', data: result.recordset[0] });
        return;
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching course', error: err.message });
        return;
    }
}