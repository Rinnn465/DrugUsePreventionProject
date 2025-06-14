import { Request, Response } from 'express';
import { sql, poolPromise } from   '../config/database';

//Get all surveys for a specific program

export async function getAllProgramSurveys(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Get survey by ID ((with SurveyCategoryName))
export async function getProgramSurveyById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
            WHERE s.SurveyID = @id
        `);
        const survey = result.recordset[0];
        if (!survey) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        res.json(survey);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Create new survey for a program 
export async function createProgramSurvey(req: Request, res: Response): Promise<void> {
    const { Description, Type, SurveyCategoryID } = req.body;
    try {
        const pool = await poolPromise;
        const insertResult = await pool.request()
            .input('Description', sql.NVarChar, Description)
            .input('Type', sql.Bit, Type)
            .input('SurveyCategoryID', SurveyCategoryID ? sql.Int : sql.Int, SurveyCategoryID || null)
            .query(`
                INSERT INTO Survey (Description, Type, SurveyCategoryID)
                OUTPUT INSERTED.SurveyID
                VALUES (@Description, @Type, @SurveyCategoryID)
            `);
        const newSurveyId = insertResult.recordset[0].SurveyID;
        const result = await pool.request()
            .input('Id', sql.Int, newSurveyId)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @Id
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Update survey for a program
export async function updateProgramSurvey(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { Description, Type, SurveyCategoryID } = req.body;
    try {
        const pool = await poolPromise;
        const updateResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('Description', sql.NVarChar, Description)
            .input('Type', sql.Bit, Type)
            .input('SurveyCategoryID', SurveyCategoryID ? sql.Int : sql.Int, SurveyCategoryID || null)
            .query(`
                UPDATE Survey
                SET Description = @Description, Type = @Type, SurveyCategoryID = @SurveyCategoryID
                WHERE SurveyID = @id
            `);
        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//Delete survey for a program
export async function deleteProgramSurvey(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    try {
        const pool = await poolPromise;
        const deleteResult = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Survey WHERE SurveyID = @id');
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Get surveys by Category ID
export async function getProgramSurveyByCategoryId(req: Request, res: Response): Promise<void> {
     const categoryId = Number(req.params.categoryId);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('categoryId', sql.Int, categoryId)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyCategoryID = @categoryId
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}