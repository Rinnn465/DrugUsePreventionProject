import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

/**
 * Interface representing a Survey in the database
 * Combines data from Survey, SurveyBeforeProgram, and SurveyAfterProgram tables
 */
interface Survey {
    SurveyID: number;          // Unique identifier for the survey
    Type: string;              // Type of survey (before/after program)
    IsDisabled: boolean;       // Survey visibility/availability status
    Expected: string | null;   // Expected outcomes (from before-program survey)
    Improvement: string | null; // Suggested improvements (from after-program survey)
}

/**
 * Retrieves all active surveys with their associated before/after program data
 * Uses LEFT JOINs to combine data from multiple survey-related tables
 * 
 * @route GET /api/surveys
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of surveys and user data
 * @throws {500} If database error occurs
 */
export const getAllSurveys = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Fetching all surveys from database...");
        const pool = await poolPromise;
        
        // Complex query joining multiple survey tables
        const result = await pool.request().query(`
            SELECT 
                s.SurveyID,    -- Primary survey identifier
                s.Type,        -- Survey type
                s.IsDisabled,  -- Availability status
                sbp.Expected,  -- Before-program expectations
                sap.Improvement -- After-program feedback
            FROM Survey s
            -- Join with before-program survey data
            LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
            -- Join with after-program survey data
            LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
            WHERE s.IsDisabled = 0  -- Only show active surveys
            ORDER BY s.SurveyID DESC -- Most recent first
        `);
        
        console.log("Surveys fetched:", result.recordset);
        // Return surveys with user context if available
        res.status(200).json({
            data: result.recordset,
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ message: "Error occurred when fetching surveys" });
    }
};

/**
 * Retrieves a specific survey by its ID with associated before/after program data
 * 
 * @route GET /api/surveys/:id
 * @access Public
 * @param {Request} req - Express request object with survey ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with survey details and user data
 * @throws {404} If survey is not found
 * @throws {500} If server error occurs
 */
export const getSurveyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log(`Fetching survey with ID: ${id}...`);
        
        const pool = await poolPromise;
        // Query specific survey with parameterized query for security
        const result = await pool.request()
            .input('id', id) // Parameterized input for SQL injection prevention
            .query(`
                SELECT 
                    s.SurveyID,    -- Primary survey identifier
                    s.Type,        -- Survey type
                    s.IsDisabled,  -- Availability status
                    sbp.Expected,  -- Before-program expectations
                    sap.Improvement -- After-program feedback
                FROM Survey s
                -- Join with before-program survey data
                LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
                -- Join with after-program survey data
                LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
                WHERE s.SurveyID = @id AND s.IsDisabled = 0
            `);

        // Check if survey exists and is active
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }

        console.log("Survey fetched:", result.recordset[0]);
        // Return survey with user context if available
        res.status(200).json({
            data: result.recordset[0],
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching survey:", error);
        res.status(500).json({ message: "Error occurred when fetching survey" });
    }
};