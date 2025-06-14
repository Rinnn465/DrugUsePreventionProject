import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

export async function getAllProgramSurveys(req: Request, res: Response): Promise<void> {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT cp.ProgramID, cp.ProgramName AS Name, cp.Description AS ProgramDescription,
        s.SurveyID, s.Description AS SurveyTitle, s.SurveyDescription as SurveyDescription,
        FROM CommunityProgramSurvey cps
        JOIN CommunityProgram cp ON cps.ProgramID = cp.ProgramID
        JOIN Survey s ON cps.SurveyID = s.SurveyID
    `);
    const grouped: Record<number, any> = {};
    result.recordset.forEach((row: any) => {
        if(!grouped[row.ProgramID]) {
            grouped[row.ProgramID] = {
                ProgramID: row.ProgramID,
                Name: row.Name,
                Description: row.ProgramDescription,
                surveys: []
            };
        }
        grouped[row.ProgramID].surveys.push({
            SurveyID: row.SurveyID,
            Title: row.SurveyTitle,
            Description: row.SurveyDescription
        });
    });
    res.json(Object.values(grouped));
    } catch (err) {
        console.error("Error fetching community program surveys:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function createProgramSurvey(req: Request, res: Response): Promise<void> {
    const { ProgramID, SurveyID } = req.body;
    if(!ProgramID || !SurveyID) {
        res.status(400).json({ message: "ProgramID and SurveyID are required" });
        return;
    }
    try{
        const pool = await poolPromise;

        //Validate if Program exists
        const programResult = await pool.request()
            .input('ProgramID', sql.Int, ProgramID)
            .query('SELECT * FROM CommunityProgram WHERE ProgramID = @ProgramID');
        if (programResult.recordset.length === 0) {
            res.status(404).json({ message: "Community Program not found" });
            return;
        }

        //Validate if Survey exists
        const surveyResult = await pool.request()
            .input('SurveyID', sql.Int, SurveyID)
            .query('SELECT * FROM Survey WHERE SurveyID = @SurveyID');
        if (surveyResult.recordset.length === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }

        //Prevent duplicate entries
        const existsResult = await pool.request()
            .input('ProgramID', sql.Int, ProgramID)
            .input('SurveyID', sql.Int, SurveyID)
            .query(`
                SELECT * FROM CommunityProgramSurvey 
                WHERE ProgramID = @ProgramID AND SurveyID = @SurveyID
            `);
        if (existsResult.recordset.length > 0) {
            res.status(409).json({ message: "This survey is already linked to the program" });
            return;
        }

        // Insert new program survey
        await pool.request()
            .input('ProgramID', sql.Int, ProgramID)
            .input('SurveyID', sql.Int, SurveyID)
            .query(`
                INSERT INTO CommunityProgramSurvey (ProgramID, SurveyID)
                VALUES (@ProgramID, @SurveyID)
            `);
        res.status(201).json({ ProgramID, SurveyID, message: "Program survey created successfully" });
            } catch (err) {
                res.status(500).json({ message: "Server error"});
            }
    }

export async function deleteProgramSurvey(req: Request, res: Response): Promise<void> {
    const ProgramID = Number(req.params.ProgramID);
    const SurveyID = Number(req.params.SurveyID);
    if(!ProgramID || !SurveyID) {
        res.status(400).json({ message: "ProgramID and SurveyID are required" });
        return;
    }
    try {
        const pool = await poolPromise;
        const deleteResult = await pool.request()
            .input('ProgramID', sql.Int, ProgramID)
            .input('SurveyID', sql.Int, SurveyID)
            .query(`
                DELETE FROM CommunityProgramSurvey 
                WHERE ProgramID = @ProgramID AND SurveyID = @SurveyID
            `);
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Program survey not found" });
            return;
        }
        res.status(204).send();
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }