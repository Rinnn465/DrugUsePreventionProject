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
        console.log("Fetching articles from database..."); // Debug log
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
        
        // Log để kiểm tra độ dài nội dung
        result.recordset.forEach((article, index) => {
            console.log(`Article ${index + 1} - ID: ${article.BlogID}`);
            console.log(`Content length: ${article.Content ? article.Content.length : 0}`);
            console.log(`Description length: ${article.Description ? article.Description.length : 0}`);
            if (article.Content && article.Content.length > 100) {
                console.log(`Content preview: ${article.Content.substring(0, 100)}...`);
            }
        });
        
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
        
        // Log để kiểm tra độ dài nội dung
        console.log(`Article ID: ${article.BlogID}`);
        console.log(`Content length: ${article.Content ? article.Content.length : 0}`);
        console.log(`Description length: ${article.Description ? article.Description.length : 0}`);
        if (article.Content && article.Content.length > 200) {
            console.log(`Content preview: ${article.Content.substring(0, 200)}...`);
        } else {
            console.log(`Full content: ${article.Content}`);
        }

        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching article:", error); // Error log
        res.status(500).json({ message: "Error occurred when fetching article" });
    }
}