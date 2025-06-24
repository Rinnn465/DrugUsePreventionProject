import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { sql, poolPromise } from "../config/database";

dotenv.config();

/**
 * Interface representing a Consultant in the database
 * Maps to the Consultant table structure
 */
interface Consultant {
    ConsultantID: number;
    Name: string;
    Specialization: string;
    Experience: string;
    IsAvailable: boolean;
}

export async function getConsultants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
        SELECT c.ConsultantID ,c.Name, c.Bio, c.Title, c.ImageUrl, c.IsDisabled, cs.ScheduleID, cs.Date, cs.StartTime, cs.EndTime
        FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
        WHERE c.IsDisabled = 0
        `);
        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

/**
 * Retrieves all consultants from the database
 *
 * @route GET /api/consultants
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with array of consultants
 * @throws {500} If database error occurs
 */


export async function getConsultantWithCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                c.ConsultantID, 
                c.Name, 
                c.Bio, 
                c.Title, 
                c.ImageUrl, 
                c.IsDisabled,
                cc.CategoryID,
                cat.CategoryName
            FROM Consultant c 
            LEFT JOIN ConsultantCategory cc ON c.ConsultantID = cc.ConsultantID
            LEFT JOIN Category cat ON cc.CategoryID = cat.CategoryID
            WHERE (c.IsDisabled = 0 OR c.IsDisabled IS NULL)
            ORDER BY c.ConsultantID, cc.CategoryID
        `);

        console.log('Raw query result:', result.recordset);

        // Group consultants by ID and collect their categories
        const consultantsMap = new Map();

        result.recordset.forEach(row => {
            const consultantId = row.ConsultantID;

            console.log(`Processing row for consultant ${consultantId}:`, {
                ConsultantID: row.ConsultantID,
                Name: row.Name,
                CategoryID: row.CategoryID,
                CategoryName: row.CategoryName
            });

            if (!consultantsMap.has(consultantId)) {
                consultantsMap.set(consultantId, {
                    ConsultantID: row.ConsultantID,
                    Name: row.Name,
                    Bio: row.Bio,
                    Title: row.Title,
                    ImageUrl: row.ImageUrl,
                    IsDisabled: row.IsDisabled || false,
                    Categories: []
                });
            }

            // Add category if it exists and is not already added
            if (row.CategoryID && row.CategoryName) {
                const consultant = consultantsMap.get(consultantId);
                const categoryExists = consultant.Categories.some(
                    (cat: any) => cat.CategoryID === row.CategoryID
                );

                if (!categoryExists) {
                    consultant.Categories.push({
                        CategoryID: row.CategoryID,
                        CategoryName: row.CategoryName
                    });
                }
            }
        });

        const groupedConsultants = Array.from(consultantsMap.values());
        groupedConsultants.map(c => ({
            name: c.Name,
            categories: c.Categories.map((cat: any) => cat.CategoryName)
        }));

        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: groupedConsultants,
        });
    } catch (err: any) {
        console.error('Error in getConsultants:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// ...existing code...

/**
 * Retrieves a specific consultant by their ID
 *
 * @route GET /api/consultants/:id
 * @access Public
 * @param {Request} req - Express request object with consultant ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with consultant details
 * @throws {404} If consultant is not found
 * @throws {500} If server error occurs
 */
export async function getConsultantById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const consultantId = req.params.id;

    try {

        // Query consultant with parameterized query for security
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("consultantId", sql.Int, consultantId)
            .query(`SELECT * 
            FROM Consultant c JOIN ConsultantSchedule cs ON c.ConsultantID = cs.ConsultantID 
            WHERE cs.ConsultantId = @consultantId`);

        // Check if consultant exists
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Consultant not found" });
            return;
        }

        res.status(200).json({
            message: "Tải dữ liệu chuyên viên thành công",
            data: result.recordset[0],
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

/**
 * Retrieves all qualifications and their associated consultants
 * Uses a JOIN operation to get qualification-consultant relationships
 *
 * @route GET /api/consultants/qualifications
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with qualifications data
 * @throws {500} If database error occurs
 */
export async function getQualifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;

        // Join query to get qualifications with consultant associations
        const result = await pool.request().query(
            `SELECT q.QualificationID, q.Name, cq.ConsultantID  
               FROM Qualification q JOIN ConsultantQualification cq ON q.QualificationID = cq.QualificationID`
        );
        res
            .status(200)
            .json({ message: "Tải dữ liệu bằng cấp thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

/**
 * Retrieves all specialties and their associated consultants
 * Uses a JOIN operation to get specialty-consultant relationships
 *
 * @route GET /api/consultants/specialties
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with specialties data
 * @throws {500} If database error occurs
 */
export async function getSpecialties(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const pool = await poolPromise;
        // Join query to get specialties with consultant associations
        const result = await pool.request().query(
            `SELECT s.SpecialtyID, s.Name, cs.ConsultantID 
               FROM Specialty s JOIN ConsultantSpecialty cs ON s.SpecialtyID = cs.SpecialtyID`
        );
        res
            .status(200)
            .json({ message: "Tải dữ liệu chuyên môn thành công", data: result.recordset });
        return;
    } catch (err: any) {
        console.error(err);
        throw new Error("Server error");
    }
}

export async function getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('SELECT * FROM ConsultantSchedule');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getConsultantSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .query('SELECT * FROM ConsultantSchedule WHERE ConsultantID = @ConsultantID');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching consultant schedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getConsulantCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { consultantId } = req.params;

    if (!consultantId) {
        res.status(400).json({ message: 'Consultant ID is required' });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConsultantID', sql.Int, consultantId)
            .query(`
                SELECT c.ConsultantID, cc.CategoryID, cat.CategoryName
                FROM Consultant c
                JOIN ConsultantCategory cc ON c.ConsultantID = cc.ConsultantID
				JOIN Category cat ON cat.CategoryID = cc.CategoryID
                WHERE c.ConsultantID = @ConsultantID
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching consultant category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
