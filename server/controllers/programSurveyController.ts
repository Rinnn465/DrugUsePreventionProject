import { Request, Response } from 'express';
import { sql, poolPromise } from   '../config/database';

/**
 * Retrieves all surveys for programs, including category names.
 *
 * @route GET /api/program-surveys
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with all program surveys
 * @throws {500} If server error occurs
 */
export async function getAllProgramSurveys(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request().query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
        `); // Query all surveys with category names
        res.json(result.recordset); // Send all surveys as response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}

/**
 * Retrieves a specific program survey by its ID, including category name.
 *
 * @route GET /api/program-surveys/:id
 * @access Public
 * @param {Request} req - Express request object with survey ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with program survey details
 * @throws {404} If survey is not found
 * @throws {500} If server error occurs
 */
export async function getProgramSurveyById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id); // Extract survey ID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
            WHERE s.SurveyID = @id
        `); // Query survey by ID with category name
        const survey = result.recordset[0];
        if (!survey) {
            res.status(404).json({ message: "Survey not found" }); // Not found
            return;
        }
        res.json(survey); // Send survey as response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}

/**
 * Creates a new survey for a program.
 *
 * @route POST /api/program-surveys
 * @access Public
 * @param {Request} req - Express request object with survey details in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created program survey
 * @throws {400} If required fields are missing or invalid
 * @throws {500} If server error occurs
 */
export async function createProgramSurvey(req: Request, res: Response): Promise<void> {
    const { Description, Type, SurveyCategoryID } = req.body; // Extract survey details from request body
    try {
        const pool = await poolPromise; // Get database connection
        const insertResult = await pool.request()
            .input('Description', sql.NVarChar, Description)
            .input('Type', sql.Bit, Type)
            .input('SurveyCategoryID', SurveyCategoryID ? sql.Int : sql.Int, SurveyCategoryID || null)
            .query(`
                INSERT INTO Survey (Description, Type, SurveyCategoryID)
                OUTPUT INSERTED.SurveyID
                VALUES (@Description, @Type, @SurveyCategoryID)
            `); // Insert new survey
        const newSurveyId = insertResult.recordset[0].SurveyID; // Get new survey ID
        const result = await pool.request()
            .input('Id', sql.Int, newSurveyId)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @Id
            `); // Query created survey with category name
        res.status(201).json(result.recordset[0]); // Send created survey as response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}

/**
 * Updates a program survey by its ID.
 *
 * @route PUT /api/program-surveys/:id
 * @access Public
 * @param {Request} req - Express request object with survey ID in params and update data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated program survey
 * @throws {404} If survey is not found
 * @throws {500} If server error occurs
 */
export async function updateProgramSurvey(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id); // Extract survey ID from URL
    const { Description, Type, SurveyCategoryID } = req.body; // Extract update data from request body
    try {
        const pool = await poolPromise; // Get database connection
        const updateResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('Description', sql.NVarChar, Description)
            .input('Type', sql.Bit, Type)
            .input('SurveyCategoryID', SurveyCategoryID ? sql.Int : sql.Int, SurveyCategoryID || null)
            .query(`
                UPDATE Survey
                SET Description = @Description, Type = @Type, SurveyCategoryID = @SurveyCategoryID
                WHERE SurveyID = @id
            `); // Update survey by ID
        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" }); // Not found
            return;
        }
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `); // Query updated survey with category name
        res.json(result.recordset[0]); // Send updated survey as response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}

/**
 * Deletes a program survey by its ID.
 *
 * @route DELETE /api/program-surveys/:id
 * @access Public
 * @param {Request} req - Express request object with survey ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} 204 No Content on success
 * @throws {404} If survey is not found
 * @throws {500} If server error occurs
 */
export async function deleteProgramSurvey(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id); // Extract survey ID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const deleteResult = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Survey WHERE SurveyID = @id'); // Delete survey by ID
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" }); // Not found
            return;
        }
        res.status(204).send(); // Send no content response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}

/**
 * Retrieves all program surveys for a specific category ID, including category name.
 *
 * @route GET /api/program-surveys/category/:categoryId
 * @access Public
 * @param {Request} req - Express request object with category ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with program surveys for the category
 * @throws {500} If server error occurs
 */
export async function getProgramSurveyByCategoryId(req: Request, res: Response): Promise<void> {
     const categoryId = Number(req.params.categoryId); // Extract category ID from URL
    try {
        const pool = await poolPromise; // Get database connection
        const result = await pool.request()
            .input('categoryId', sql.Int, categoryId)
            .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyCategoryID = @categoryId
            `); // Query surveys by category ID
        res.json(result.recordset); // Send surveys as response
    } catch (err) {
        res.status(500).json({ message: "Server error" }); // Send error response
    }
}