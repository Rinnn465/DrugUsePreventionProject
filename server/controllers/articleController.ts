import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

interface Article {
    BlogID: number;
    AccountID: number;
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
            SELECT BlogID, AccountID, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);
        console.log("Articles fetched:", result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Error occurred when fetching articles"});
    }

}