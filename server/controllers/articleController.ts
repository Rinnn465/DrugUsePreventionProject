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
        console.log("Fetching articles from database..."); // Debug log
        const pool = await poolPromise;
        // Query to get all active articles, sorted by newest first
        const result = await pool.request().query(`
            SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);
        console.log("Articles fetched:", result.recordset); // Debug log
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
 * @returns {Promise<void>} JSON response with article details
 * @throws {400} If article ID is invalid
 * @throws {404} If article is not found or is disabled
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    console.log(req.params); // Debug log for request parameters

    // Validate article ID
    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }

    try {
        console.log(`Fetching article with ID: ${articleId}`); // Debug log
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

        console.log("Article fetched:", result.recordset[0]); // Debug log
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching article:", error); // Error log
        res.status(500).json({ message: "Error occurred when fetching article" });
    }
}