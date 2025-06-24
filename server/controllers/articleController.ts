import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

/**
 * Interface representing an Article in the database
 * Maps to the Article table structure
 */
interface Article {
    BlogID: number;      // Unique identifier for the article
    AccountID: number;   // ID of the account that created the article
    ArticleTitle: string; // Title of the article
    PublishedDate: Date; // Date when the article was published
    ImageUrl: string | null; // Optional URL for article's featured image
    Author: string;      // Name of the article's author
    Status: string;      // Publication status (e.g., draft, published)
    Content: string;     // Main content of the article
    IsDisabled: boolean; // Flag to soft-delete/disable articles
}

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
        console.log("Fetching articles from database..."); // Log start of fetch
        const pool = await poolPromise; // Get database connection
        // Query to get all active articles, sorted by newest first
        const result = await pool.request().query(`
            SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);
        console.log("Articles fetched:", result.recordset); // Log fetched articles
        res.status(200).json(result.recordset); // Send articles as response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error fetching articles:", message); // Log error
        res.status(500).json({ message: "Error occurred when fetching articles" }); // Send error response
    }

}

/**
 * Retrieves a specific article by its ID
 * Only returns the article if it's not disabled
 * 
 * @route GET /api/articles/:id
 * @param id The article's BlogID
 * @access Public
 * @returns {Promise<void>} JSON response with article details
 * @throws {400} If article ID is invalid
 * @throws {404} If article is not found or is disabled
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    console.log(req.params); // Log request parameters

    // Validate article ID
    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }

    try {
        console.log(`Fetching article with ID: ${articleId}`); // Log fetch attempt
        const pool = await poolPromise;
        // Query single article with parameterized query for security
        const result = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        // Check if article exists and is active
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        console.log("Article fetched:", result.recordset[0]); // Log fetched article
        res.status(200).json(result.recordset[0]); // Send article as response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error fetching article:", message); // Log error
        res.status(500).json({ message: "Error occurred when fetching article" });
    }
}

/**
 * Creates a new article in the database
 * 
 * @route POST /api/articles
 * @access Protected (assuming authentication required)
 * @returns {Promise<void>} JSON response with created article details
 * @throws {400} If required fields are missing or invalid
 * @throws {500} If database operation fails
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
    const { AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content } = req.body;
    
    // Validate required fields
    if (!AccountID || !ArticleTitle || !PublishedDate || !Author || !Status || !Content) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        console.log("Creating new article:", { ArticleTitle, Author }); // Log creation attempt
        const pool = await poolPromise;
        // Insert new article with parameterized query
        const result = await pool.request()
            .input('AccountID', AccountID)
            .input('ArticleTitle', ArticleTitle)
            .input('PublishedDate', new Date(PublishedDate)) // Ensure date is valid
            .input('ImageUrl', ImageUrl || null)
            .input('Author', Author)
            .input('Status', Status)
            .input('Content', Content)
            .input('IsDisabled', false)
            .query(`
                INSERT INTO Article (AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled)
                OUTPUT INSERTED.*
                VALUES (@AccountID, @ArticleTitle, @PublishedDate, @ImageUrl, @Author, @Status, @Content, @IsDisabled)
            `);
        res.status(201).json(result.recordset[0]); // Send created article as response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error creating article:", message); // Log error
        res.status(500).json({ message: "Error occurred when creating article" });
    }
}

/**
 * Updates an existing article by its ID
 * Only updates provided fields and maintains existing values for omitted fields
 * 
 * @route PUT /api/articles/:id
 * @param id The article's BlogID
 * @access Protected (assuming authentication required)
 * @returns {Promise<void>} JSON response with updated article details
 * @throws {400} If article ID is invalid
 * @throws {404} If article is not found or is disabled
 * @throws {500} If database operation fails
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    const { ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content } = req.body;

    // Validate article ID
    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }
    try {
        console.log(`Updating article with ID: ${articleId}`); // Log update attempt
        const pool = await poolPromise;

        // First, check if article exists and is not disabled
        const checkResult = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        // Build dynamic update query based on provided fields
        const updates: string[] = [];
        const inputs: { name: string, value: any }[] = [];

        if (ArticleTitle) {
            updates.push('ArticleTitle = @ArticleTitle');
            inputs.push({ name: 'ArticleTitle', value: ArticleTitle });
        }
        if (PublishedDate) {
            updates.push('PublishedDate = @PublishedDate');
            inputs.push({ name: 'PublishedDate', value: new Date(PublishedDate) });
        }
        if (ImageUrl !== undefined) {
            updates.push('ImageUrl = @ImageUrl');
            inputs.push({ name: 'ImageUrl', value: ImageUrl });
        }
        if (Author) {
            updates.push('Author = @Author');
            inputs.push({ name: 'Author', value: Author });
        }
        if (Status) {
            updates.push('Status = @Status');
            inputs.push({ name: 'Status', value: Status });
        }
        if (Content) {
            updates.push('Content = @Content');
            inputs.push({ name: 'Content', value: Content });
        }

        if (updates.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        // Construct the dynamic SQL update query
        const updateQuery = `
            UPDATE Article
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE BlogID = @BlogID AND IsDisabled = 0
        `;

        // Add all dynamic inputs to the request
        const request = pool.request().input('BlogID', articleId);
        inputs.forEach(input => request.input(input.name, input.value));

        const result = await request.query(updateQuery); // Execute update
        res.status(200).json(result.recordset[0]); // Send updated article as response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Error occurred when updating article" });
    }
}

/**
 * Soft-deletes an article by its ID by setting IsDisabled to true
 * 
 * @route DELETE /api/articles/:id
 * @param id The article's BlogID
 * @access Protected (assuming authentication required)
 * @returns {Promise<void>} JSON response confirming deletion
 * @throws {400} If article ID is invalid
 * @throws {404} If article is not found or already disabled
 * @throws {500} If database operation fails
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);

    // Validate article ID
    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }

    try {
        console.log(`Deleting article with ID: ${articleId}`); // Log delete attempt
        const pool = await poolPromise;

        // Check if article exists and is not already disabled
        const checkResult = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        // Soft-delete by setting IsDisabled to true
        await pool.request()
            .input('BlogID', articleId)
            .query(`
                UPDATE Article
                SET IsDisabled = 1
                WHERE BlogID = @BlogID
            `);
        res.status(200).json({ message: "Article deleted successfully" }); // Send confirmation
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error deleting article:", message); // Log error
        res.status(500).json({ message: "Error occurred when deleting article" });
    }
}