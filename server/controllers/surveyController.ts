import { Request, Response } from 'express';
import { poolPromise } from '../config/database';



/**
 * Interface đại diện cho một khảo sát trong cơ sở dữ liệu
 * Kết hợp dữ liệu từ các bảng Survey, SurveyBeforeProgram và SurveyAfterProgram
 */

/**
 * Lấy tất cả khảo sát đang hoạt động cùng dữ liệu khảo sát trước/sau chương trình
 * Sử dụng LEFT JOIN để kết hợp dữ liệu từ nhiều bảng liên quan khảo sát
 * 
 * @route GET /api/surveys
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với mảng khảo sát và thông tin người dùng
 * @throws {500} Nếu có lỗi truy vấn cơ sở dữ liệu
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
 * Lấy khảo sát cụ thể theo ID, kèm dữ liệu khảo sát trước/sau chương trình
 * 
 * @route GET /api/surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết khảo sát và thông tin người dùng
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
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

/**
 * Lấy tất cả khảo sát của một chương trình cụ thể, bao gồm tên danh mục
 * 
 * @route GET /api/program-surveys/:programId
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với khảo sát chương trình và thông tin người dùng
 * @throws {500} Nếu có lỗi máy chủ
 */
export const getProgramSurveys = async (req: Request, res: Response): Promise<void> => {
    try {
        const { programId } = req.params;
        console.log(`Fetching surveys for program ID: ${programId}...`);

        const pool = await poolPromise;
        // Query all surveys for the specified program
        const result = await pool.request()
            .input('programId', programId) // Parameterized input for security
            .query(`
                SELECT 
                    s.SurveyID, 
                    s.Type, 
                    s.IsDisabled, 
                    sbp.Expected, 
                    sap.Improvement,
                    c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
                LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.ProgramID = @programId AND s.IsDisabled = 0
                ORDER BY s.SurveyID DESC
            `);

        console.log("Program surveys fetched:", result.recordset);
        // Return surveys with user context if available
        res.status(200).json({
            data: result.recordset,
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching program surveys:", error);
        res.status(500).json({ message: "Error occurred when fetching program surveys" });
    }
}

//create a new survey
export const createSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, isDisabled, expected, improvement } = req.body;
        console.log("Creating new survey with data:", req.body);

        const pool = await poolPromise;
        // Insert new survey into the database
        const result = await pool.request()
            .input('type', type)
            .input('isDisabled', isDisabled)
            .input('expected', expected)
            .input('improvement', improvement)
            .query(`
                INSERT INTO Survey (Type, IsDisabled)
                VALUES (@type, @isDisabled);
                SELECT SCOPE_IDENTITY() AS SurveyID; -- Get the new survey ID
            `);
        const newSurveyId = result.recordset[0].SurveyID;
        console.log("New survey created with ID:", newSurveyId);
        // Insert before/after program data if provided
        if (expected || improvement) {
            await pool.request()
                .input('surveyId', newSurveyId)
                .input('expected', expected || null)
                .input('improvement', improvement || null)
                .query(`
                    INSERT INTO SurveyBeforeProgram (SurveyID, Expected)
                    VALUES (@surveyId, @expected);
                    INSERT INTO SurveyAfterProgram (SurveyID, Improvement)
                    VALUES (@surveyId, @improvement);
                `);
        }
        // Return the newly created survey
        const surveyResult = await pool.request()
            .input('id', newSurveyId)
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
                WHERE s.SurveyID = @id
            `);
        console.log("New survey details:", surveyResult.recordset[0]);
        // Return the created survey with user context if available
        res.status(201).json({
            data: surveyResult.recordset[0],
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error creating survey:", error);
        res.status(500).json({ message: "Error occurred when creating survey" });
    }
}

/**
 * Cập nhật khảo sát theo ID
 * 
 * @route PUT /api/surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON response with updated survey details and user data
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
 */
export const updateSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, isDisabled, expected, improvement } = req.body;
        console.log(`Updating survey with ID: ${id} with data:`, req.body);

        const pool = await poolPromise;
        // Update the survey in the database
        const result = await pool.request()
            .input('id', id)
            .input('type', type)
            .input('isDisabled', isDisabled)
            .query(`
                UPDATE Survey
                SET Type = @type, IsDisabled = @isDisabled
                WHERE SurveyID = @id;
            `);
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        console.log("Survey updated successfully");

        // Update before/after program data if provided
        if (expected || improvement) {
            await pool.request()
                .input('surveyId', id)
                .input('expected', expected || null)
                .input('improvement', improvement || null)
                .query(`
                    UPDATE SurveyBeforeProgram
                    SET Expected = @expected
                    WHERE SurveyID = @surveyId;
                    UPDATE SurveyAfterProgram
                    SET Improvement = @improvement
                    WHERE SurveyID = @surveyId;
                `);
        }
        // Return the updated survey details
        const surveyResult = await pool.request()
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
                WHERE s.SurveyID = @id
            `);
        console.log("Updated survey details:", surveyResult.recordset[0]);
        // Return the updated survey with user context if available
        res.status(200).json({
            data: surveyResult.recordset[0],
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error updating survey:", error);
        res.status(500).json({ message: "Error occurred when updating survey" });
    }
}
/**
 * Xóa khảo sát theo ID
 * 
 * @route DELETE /api/surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} JSON response with success message and user data
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
 */
export const deleteSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log(`Deleting survey with ID: ${id}...`);

        const pool = await poolPromise;
        // Delete the survey from the database
        const result = await pool.request()
            .input('id', id)
            .query(`
                DELETE FROM Survey
                WHERE SurveyID = @id;
            `);
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Survey not found" });
            return;
        }
        console.log("Survey deleted successfully");
        // Return success message with user context if available
        res.status(200).json({
            message: "Survey deleted successfully",
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error deleting survey:", error);
        res.status(500).json({ message: "Error occurred when deleting survey" });
    }
}

//get surveys by category ID
/**
 * Lấy tất cả khảo sát theo ID danh mục
 * @route GET /api/surveys/category/:categoryId
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với khảo sát thuộc danh mục và thông tin người dùng
 * @throws {500} Nếu có lỗi máy chủ
 * */
export const getSurveyByCategoryId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        console.log(`Fetching surveys for category ID: ${categoryId}...`);

        const pool = await poolPromise;
        // Query surveys by category ID
        const result = await pool.request()
            .input('categoryId', categoryId)
            .query(`
                SELECT 
                    s.SurveyID, 
                    s.Type, 
                    s.IsDisabled, 
                    sbp.Expected, 
                    sap.Improvement,
                    c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyBeforeProgram sbp ON s.SurveyID = sbp.SurveyID
                LEFT JOIN SurveyAfterProgram sap ON s.SurveyID = sap.SurveyID
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE c.SurveyCategoryID = @categoryId AND s.IsDisabled = 0
                ORDER BY s.SurveyID DESC
            `);

        console.log("Surveys by category fetched:", result.recordset);
        // Return surveys with user context if available
        res.status(200).json({
            data: result.recordset,
            user: (req as any).user ? { ...((req as any).user).user } : null
        });
    } catch (error) {
        console.error("Error fetching surveys by category:", error);
        res.status(500).json({ message: "Error occurred when fetching surveys by category" });
    }
}
