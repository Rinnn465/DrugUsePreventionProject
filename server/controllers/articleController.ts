import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

interface Article {
    BlogID: number;
    AccountID: number;
    ArticleTitle: string;
    PublishedDate: Date;
    ImageUrl: string | null;
    Author: string;
    Status: string;
    Content: string;
    IsDisabled: boolean;
}

export const getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Fetching articles from database...");
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);
        console.log("Articles fetched:", result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Error occurred when fetching articles" });
    }

}

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    console.log(req.params);

    if (isNaN(articleId)) {
        res.status(400).json({ message: "Invalid article ID" });
        return;
    }

    try {
        console.log(`Fetching article with ID: ${articleId}`);
        const pool = await poolPromise;
        const result = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        console.log("Article fetched:", result.recordset[0]);
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({ message: "Error occurred when fetching article" });
    }
}