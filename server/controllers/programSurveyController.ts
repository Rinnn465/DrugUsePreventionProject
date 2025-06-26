import { Request, Response } from 'express';
import { sql, poolPromise } from   '../config/database';

/**
 * Lấy tất cả khảo sát của các chương trình, bao gồm tên danh mục.
 *
 * @route GET /api/program-surveys
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với tất cả khảo sát chương trình
 * @throws {500} Nếu có lỗi máy chủ
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
 * Lấy khảo sát chương trình theo ID, bao gồm tên danh mục.
 *
 * @route GET /api/program-surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết khảo sát chương trình
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
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
 * Tạo mới khảo sát cho chương trình.
 *
 * @route POST /api/program-surveys
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa thông tin khảo sát trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với khảo sát chương trình vừa tạo
 * @throws {400} Nếu thiếu hoặc sai trường bắt buộc
 * @throws {500} Nếu có lỗi máy chủ
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
 * Cập nhật khảo sát chương trình theo ID.
 *
 * @route PUT /api/program-surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với khảo sát chương trình đã cập nhật
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
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
 * Xóa khảo sát chương trình theo ID.
 *
 * @route DELETE /api/program-surveys/:id
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID khảo sát trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} 204 No Content nếu thành công
 * @throws {404} Nếu không tìm thấy khảo sát
 * @throws {500} Nếu có lỗi máy chủ
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
 * Lấy tất cả khảo sát chương trình theo ID danh mục, bao gồm tên danh mục.
 *
 * @route GET /api/program-surveys/category/:categoryId
 * @access Công khai
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với các khảo sát chương trình thuộc danh mục
 * @throws {500} Nếu có lỗi máy chủ
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