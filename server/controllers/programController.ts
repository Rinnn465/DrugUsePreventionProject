import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

/**
 * Interface representing a Community Program in the database
 * Maps to the CommunityProgram table structure
 */
interface Program {
  ProgramID: number;        // Unique identifier for the program
  ProgramName: string;      // Name of the community program
  Type: string;            // Type/category of the program
  Date: Date;              // Program date and time
  Description: string | null; // Detailed program description
  Organizer: string;       // Organization running the program
  Location: string;        // Program venue/location
  ImageUrl: string | null; // URL for program banner/image
  IsDisabled: boolean;     // Program visibility status
}

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
export const getAllPrograms = async (req: Request, res: Response): Promise<void> => {
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
      user: (req as any).user ? { ...((req as any).user).user } : null
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Error occurred when fetching programs" });
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
export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Fetching program with ID: ${id}...`);

    const pool = await poolPromise;
    // Query specific program with parameterized query for security
    const result = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    ProgramID,
                    ProgramName,
                    Type,
                    Date,
                    Description,
                    Organizer,
                    Location,
                    ImageUrl,
                    IsDisabled
                FROM CommunityProgram
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
      user: (req as any).user ? { ...((req as any).user).user } : null
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ message: "Error occurred when fetching program" });
  }
};

/**
 * Retrieves all upcoming community programs
 * Returns only programs with dates in the future, ordered by date
 * 
 * @route GET /api/programs/upcoming
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of upcoming programs
 * @throws {500} If database error occurs
 */
export const getUpcomingPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching upcoming programs...");
    const pool = await poolPromise;
    // Query future programs using SQL Server's GETDATE()
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE Date > GETDATE() AND IsDisabled = 0
            ORDER BY Date ASC
        `);
    console.log("Upcoming programs fetched:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching upcoming programs:", error);
    res.status(500).json({ message: "Error occurred when fetching upcoming programs" });
  }
}

/**
 * Retrieves all past community programs
 * Returns only programs with dates in the past, ordered by date
 * 
 * @route GET /api/programs/past
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of past programs
 * @throws {500} If database error occurs
 */
export const getPastPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching past programs...");
    const pool = await poolPromise;
    // Query past programs using SQL Server's GETDATE()
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE Date < GETDATE() AND IsDisabled = 0
            ORDER BY Date DESC
        `);
    console.log("Past programs fetched:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching past programs:", error);
    res.status(500).json({ message: "Error occurred when fetching past programs" });
  }
}

//delete
/** 
 * Deletes a specific community program by its ID
 * Marks the program as disabled instead of deleting it 
 * * @route DELETE /api/programs/:id
 * @access Admin
 * @param {Request} req - Express request object with program ID in params
 * @param {Response} res - Express response object
 *  * @returns {Promise<void>} JSON response with success message
 * * @throws {404} If program is not found
 * * @throws {500} If server error occurs
 * */
export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Deleting program with ID: ${id}...`);

    const pool = await poolPromise;
    // Update program to mark as disabled
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE CommunityProgram
                SET IsDisabled = 1
                WHERE ProgramID = @id AND IsDisabled = 0
            `);

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Program not found or already disabled" });
      return;
    }

    console.log("Program deleted successfully");
    res.status(200).json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ message: "Error occurred when deleting program" });
  }
}
