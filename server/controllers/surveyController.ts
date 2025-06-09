import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

interface Survey {
    SurveyID: number;
    Type: string;
    IsDisabled: boolean;
    Expected: string | null;
    Improvement: string | null;
}

export const getAllSurveys = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Fetching all surveys from database...");
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                s.SurveyID,
                s.Type,
                s.IsDisabled,
                sbp.Expected,
                sap.Improvement
            FROM Survey s
            LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
            LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
            WHERE s.IsDisabled = 0
            ORDER BY s.SurveyID DESC
        `);
        console.log("Surveys fetched:", result.recordset);
        res.status(200).json({
            data: result.recordset,
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ message: "Error occurred when fetching surveys" });
    }
};

export const getSurveyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log(`Fetching survey with ID: ${id}...`);
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT 
                    s.SurveyID,
                    s.Type,
                    s.IsDisabled,
                    sbp.Expected,
                    sap.Improvement
                FROM Survey s
                LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
                LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
                WHERE s.SurveyID = @id AND s.IsDisabled = 0
            `);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        console.log("Survey fetched:", result.recordset[0]);
        res.status(200).json({
            data: result.recordset[0],
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching survey:", error);
        res.status(500).json({ message: "Error occurred when fetching survey" });
    }
};