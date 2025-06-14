import { Request, Response } from "express";
import { sql , poolPromise } from "../config/database";

/**
 * Retrieves all active community programs
 * Returns programs ordered by date, newest first
 *
 * @route GET /api/programs
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of programs and user data
 * @throws {500} If database error occurs
 */
export const getAllPrograms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Fetching all programs from database...");
    const pool = await poolPromise;
    // Query all active programs, ordered by date
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                Url,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE IsDisabled = 0
            ORDER BY Date DESC
        `);
    console.log("Programs fetched:", result.recordset);
    // Return programs with user context if available
    res.status(200).json({
      data: result.recordset,
      user: (req as any).user ? { ...(req as any).user.user } : null,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves a specific program by its ID
 * Only returns active (non-disabled) programs
 *
 * @route GET /api/programs/:id
 * @access Public
 * @param {Request} req - Express request object with program ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with program details and user data
 * @throws {404} If program is not found
 * @throws {500} If server error occurs
 */
export const getProgramById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Fetching program with ID: ${id}...`);

    const pool = await poolPromise;
    // Query specific program with parameterized query for security
    const result = await pool.request().input("id", id).query(`
                SELECT * FROM CommunityProgram
                WHERE ProgramID = @id AND IsDisabled = 0
            `);

    // Check if program exists
    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    console.log("Program fetched:", result.recordset[0]);
    res.status(200).json({
      data: result.recordset[0],
      user: (req as any).user ? { ...(req as any).user.user } : null,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ message: "Error occurred when fetching program" });
  }
};

// Create Commmunity Program

export async function createProgram(req: Request, res: Response): Promise<void> {
    const { ProgramName, Type, date, Description, Organizer, Location, Url, ImageUrl, IsDisabled} = req.body;
    try {
    const pool = await poolPromise;
    const insertResult = await pool.request()
      .input('ProgramName', sql.NVarChar, ProgramName)
            .input('Type', sql.NVarChar, Type || null)
            .input('Date', sql.DateTime, date)
            .input('Description', sql.NVarChar, Description || null)
            .input('Organizer', sql.NVarChar, Organizer || null)
            .input('Location', sql.NVarChar, Location || null)
            .input('Url', sql.NVarChar, Url || null)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`
                INSERT INTO CommunityProgram 
                (ProgramName, Type, Date, Description, Organizer, Location, Url, ImageUrl, IsDisabled)
                OUTPUT INSERTED.ProgramID
                VALUES (@ProgramName, @Type, @date, @Description, @Organizer, @Location, @Url, @ImageUrl, @IsDisabled)
            `);
      const newProgramId = insertResult.recordset[0].ProgramID;
      const result = await pool.request()
        .input('Id', sql.Int, newProgramId)
        .query('SELECT * FROM CommunityProgram WHERE ProgramID = @Id');
    res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Update Community Program
export async function updateProgram(req: Request, res: Response): Promise<void> {
    const { id } = req.params; Number(id);
    const { ProgramName, Type, date, Description, Organizer, Location, Url, ImageUrl, IsDisabled } = req.body;
    try {
        const pool = await poolPromise;
        const updateResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('ProgramName', sql.NVarChar, ProgramName)
            .input('Type', sql.NVarChar, Type || null)
            .input('Date', sql.DateTime, date)
            .input('Description', sql.NVarChar, Description || null)
            .input('Organizer', sql.NVarChar, Organizer || null)
            .input('Location', sql.NVarChar, Location || null)
            .input('Url', sql.NVarChar, Url || null)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`
                UPDATE CommunityProgram
                SET ProgramName = @ProgramName,
                    Type = @Type,
                    Date = @date,
                    Description = @Description,
                    Organizer = @Organizer,
                    Location = @Location,
                    Url = @Url,
                    ImageUrl = @ImageUrl,
                    IsDisabled = @IsDisabled
                WHERE ProgramID = @id
            `);
        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Program not found" });
            return;
        }
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT * FROM CommunityProgram WHERE ProgramID = @Id');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Delete Community Program
export async function deleteProgram(req: Request, res: Response): Promise<void> {
    const { Id } = req.params; Number(Id);
    try {
        const pool = await poolPromise;
        const deleteResult = await pool.request()
            .input('Id', sql.Int, Id)
            .query('DELETE FROM CommunityProgram WHERE ProgramID = @Id');
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Program not found" });
            return;
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}