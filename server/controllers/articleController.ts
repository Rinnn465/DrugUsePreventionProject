import { Request, Response } from 'express';
import { poolPromise } from '../config/database';
import { Article } from '../types/type';



/**
 * Retrieves all active articles from the database
 * Returns only articles that aren't disabled, ordered by publish date
 * 
 * @route GET /api/articles
 * @access Public
 * @returns {Promise<void>} JSON response with array of articles
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
        const pool = await poolPromise;
        // Query to get all active articles, sorted by newest first
        // Sử dụng CAST để đảm bảo lấy đầy đủ nội dung từ các trường text/ntext
        const result = await pool.request().query(`
            SELECT 
                BlogID, 
                AccountID, 
                ArticleTitle, 
                PublishedDate, 
                ImageUrl, 
                Author, 
                Status, 
                CAST(Description AS NVARCHAR(MAX)) as Description,
                CAST(Content AS NVARCHAR(MAX)) as Content,
                IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching articles:", error); // Error log
        res.status(500).json({ message: "Error occurred when fetching articles" });
    }
}

/**
 * Retrieves a specific article by its ID
 * Only returns the article if it's not disabled
 * 
 * @route GET /api/articles/:id
 * @param id The article's BlogID
 * @access Public
 * @returns {Promise<void} JSON response with article details
 * @throws {400} If article ID is invalid
 * @throws {404} If article is not found or is disabled
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);

    // Validate article ID
    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Query single article with parameterized query for security
        // Sử dụng CAST để đảm bảo lấy đầy đủ nội dung từ các trường text/ntext
        const result = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT 
                    BlogID, 
                    AccountID, 
                    ArticleTitle, 
                    PublishedDate, 
                    ImageUrl, 
                    Author, 
                    Status, 
                    CAST(Description AS NVARCHAR(MAX)) as Description,
                    CAST(Content AS NVARCHAR(MAX)) as Content,
                    IsDisabled
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        // Check if article exists and is active
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        const article = result.recordset[0];

        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching article:", error); // Error log
        res.status(500).json({ message: "Error occurred when fetching article" });
    }
}

/**
 * Tạo mới một bài viết
 * @route POST /api/articles
 * @access Public (hoặc Quản trị viên tuỳ yêu cầu)
 * @param {Request} req - Dữ liệu bài viết trong body (theo type Article)
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với bài viết vừa tạo
 * @throws {400} Nếu dữ liệu không hợp lệ
 * @throws {500} Nếu có lỗi máy chủ
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
    const {
        AccountID,
        ArticleTitle,
        PublishedDate,
        ImageUrl,
        Author,
        Status,
        Description,
        Content,
        IsDisabled
    } = req.body;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!ArticleTitle || !Content) {
        res.status(400).json({ message: "Tiêu đề và nội dung bài viết là bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        const insertResult = await pool.request()
            .input('AccountID', AccountID)
            .input('ArticleTitle', ArticleTitle)
            .input('PublishedDate', PublishedDate)
            .input('ImageUrl', ImageUrl)
            .input('Author', Author)
            .input('Status', Status)
            .input('Description', Description)
            .input('Content', Content)
            .input('IsDisabled', IsDisabled ?? 0)
            .query(`
                INSERT INTO Article 
                (AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Description, Content, IsDisabled)
                OUTPUT INSERTED.BlogID
                VALUES (@AccountID, @ArticleTitle, @PublishedDate, @ImageUrl, @Author, @Status, @Description, @Content, @IsDisabled)
            `);
        const newArticleId = insertResult.recordset[0].BlogID;
        const result = await pool.request()
            .input('BlogID', newArticleId)
            .query('SELECT * FROM Article WHERE BlogID = @BlogID');
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ message: "Error occurred when creating article" });
    }
}

/**
 * Xóa một bài viết theo ID
 * @route DELETE /api/articles/:id
 * @access Public (hoặc Quản trị viên tuỳ yêu cầu)
 * @param {Request} req - Chứa BlogID trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông báo thành công hoặc lỗi
 * @throws {404} Nếu không tìm thấy bài viết
 * @throws {500} Nếu có lỗi máy chủ
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    if (isNaN(articleId)) {
        res.status(400).json({ message: "ID bài viết không hợp lệ" });
        return;
    }
    try {
        const pool = await poolPromise;
        const deleteResult = await pool.request()
            .input('BlogID', articleId)
            .query('DELETE FROM Article WHERE BlogID = @BlogID');
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
            return;
        }
        res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ message: "Có lỗi khi xóa bài viết" });
    }
};

/**
 * Cập nhật một bài viết theo ID
 * @route PUT /api/articles/:id
 * @access Public (hoặc Quản trị viên tuỳ yêu cầu)
 * @param {Request} req - Chứa BlogID trong params và dữ liệu bài viết trong body (theo type Article)
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với bài viết đã cập nhật hoặc lỗi
 * @throws {400} Nếu dữ liệu không hợp lệ
 * @throws {404} Nếu không tìm thấy bài viết
 * @throws {500} Nếu có lỗi máy chủ
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    if (isNaN(articleId)) {
        res.status(400).json({ message: "ID bài viết không hợp lệ" });
        return;
    }
    const {
        ArticleTitle,
        Author,
        Content,
        IsDisabled
    } = req.body;
    if (!ArticleTitle || !Content) {
        res.status(400).json({ message: "Tiêu đề và nội dung bài viết là bắt buộc" });
        return;
    }
    try {
        const pool = await poolPromise;
        const updateResult = await pool.request()
            .input('BlogID', articleId)
            .input('ArticleTitle', ArticleTitle)
            .input('Author', Author)
            .input('Content', Content)
            .input('IsDisabled', IsDisabled ?? 0)
            .query(`
                UPDATE Article SET
                    ArticleTitle = @ArticleTitle,
                    Author = @Author,
                    Content = @Content,
                    IsDisabled = @IsDisabled
                WHERE BlogID = @BlogID  
            `);
        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
            return;
        }
        const result = await pool.request()
            .input('BlogID', articleId)
            .query('SELECT * FROM Article WHERE BlogID = @BlogID');
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ message: "Có lỗi khi cập nhật bài viết" });
    }
};


