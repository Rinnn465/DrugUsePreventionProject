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
 * Interface representing a ProgramCategory in the database
 * Maps to the ProgramCategory table structure
 */
interface ProgramCategory {
  CategoryID: number;       // Unique identifier for the category
  CategoryName: string;     // Name of the category
  Description: string | null; // Optional description of the category
  IsDisabled: boolean;      // Category visibility status
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

/**
 * Creates a new community program
 * 
 * @route POST /api/programs
 * @access Admin
 * @param {Request} req - Express request object with program data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created program details
 * @throws {500} If database error occurs
 */
export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ProgramName, Type, Date, Description, Organizer, Location, ImageUrl } = req.body;
    console.log("Creating new program:", req.body);

    const pool = await poolPromise;
    // Insert new program into database
    const result = await pool.request()
      .input('ProgramName', ProgramName)
      .input('Type', Type)
      .input('Date', Date)
      .input('Description', Description)
      .input('Organizer', Organizer)
      .input('Location', Location)
      .input('ImageUrl', ImageUrl)
      .query(`
                INSERT INTO CommunityProgram (ProgramName, Type, Date, Description, Organizer, Location, ImageUrl, IsDisabled)
                VALUES (@ProgramName, @Type, @Date, @Description, @Organizer, @Location, @ImageUrl, 0);
                SELECT SCOPE_IDENTITY() AS ProgramID; -- Get the ID of the newly created program
            `);

    const newProgramId = result.recordset[0].ProgramID;
    console.log("New program created with ID:", newProgramId);
    
    // Fetch the newly created program details
    const newProgramResult = await pool.request()
      .input('id', newProgramId)
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
                WHERE ProgramID = @id
            `);

    res.status(201).json(newProgramResult.recordset[0]);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ message: "Error occurred when creating program" });
  }
}

/**
 * Updates an existing community program by its ID
 * 
 * @route PUT /api/programs/:id
 * @access Admin
 * @param {Request} req - Express request object with program ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated program details
 * @throws {404} If program is not found
 * @throws {500} If server error occurs
 */
export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ProgramName, Type, Date, Description, Organizer, Location, ImageUrl } = req.body;
    console.log(`Updating program with ID: ${id}`, req.body);

    const pool = await poolPromise;
    // Update program details
    const result = await pool.request()
      .input('id', id)
      .input('ProgramName', ProgramName)
      .input('Type', Type)
      .input('Date', Date)
      .input('Description', Description)
      .input('Organizer', Organizer)
      .input('Location', Location)
      .input('ImageUrl', ImageUrl)
      .query(`
                UPDATE CommunityProgram
                SET 
                    ProgramName = @ProgramName,
                    Type = @Type,
                    Date = @Date,
                    Description = @Description,
                    Organizer = @Organizer,
                    Location = @Location,
                    ImageUrl = @ImageUrl
                WHERE ProgramID = @id AND IsDisabled = 0;
            `);

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Program not found or already disabled" });
      return;
    }

    console.log("Program updated successfully");

    // Fetch the updated program details
    const updatedProgramResult = await pool.request()
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
                WHERE ProgramID = @id
            `);

    res.status(200).json(updatedProgramResult.recordset[0]);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ message: "Error occurred when updating program" });
  }
}

/**
 * Retrieves all program categories
 * 
 * @route GET /api/program-categories
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of program categories
 * @throws {500} If database error occurs
 */   
export const getProgramCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching all program categories...");
    const pool = await poolPromise;
    // Query all program categories
    const result = await pool.request().query(`
            SELECT 
                CategoryID,
                CategoryName,
                Description,
                IsDisabled
            FROM ProgramCategory
            WHERE IsDisabled = 0
            ORDER BY CategoryName ASC
        `);
    console.log("Program categories fetched:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching program categories:", error);
    res.status(500).json({ message: "Error occurred when fetching program categories" });
  }
}

/**
 * Retrieves a specific program category by its ID
 * 
 * @route GET /api/program-categories/:id
 * @access Public
 * @param {Request} req - Express request object with category ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with program category details
 * @throws {404} If category is not found
 * @throws {500} If server error occurs
 */
export const getProgramCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Fetching program category with ID: ${id}...`);

    const pool = await poolPromise;
    // Query specific category with parameterized query for security
    const result = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id AND IsDisabled = 0
            `);

    // Check if category exists
    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Program category not found" });
      return;
    }

    console.log("Program category fetched:", result.recordset[0]);
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching program category:", error);
    res.status(500).json({ message: "Error occurred when fetching program category" });
  }
}

/**
 * Creates a new program category
 * 
 * @route POST /api/program-categories
 * @access Admin
 * @param {Request} req - Express request object with category data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created category details
 * @throws {500} If database error occurs
 */

export const createProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { CategoryName, Description } = req.body;
    console.log("Creating new program category:", req.body);

    const pool = await poolPromise;
    // Insert new category into database
    const result = await pool.request()
      .input('CategoryName', CategoryName)
      .input('Description', Description)
      .query(`
                INSERT INTO ProgramCategory (CategoryName, Description, IsDisabled)
                VALUES (@CategoryName, @Description, 0);
                SELECT SCOPE_IDENTITY() AS CategoryID; -- Get the ID of the newly created category
            `);

    const newCategoryId = result.recordset[0].CategoryID;
    console.log("New program category created with ID:", newCategoryId);
    
    // Fetch the newly created category details
    const newCategoryResult = await pool.request()
      .input('id', newCategoryId)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id
            `);

    res.status(201).json(newCategoryResult.recordset[0]);
  } catch (error) {
    console.error("Error creating program category:", error);
    res.status(500).json({ message: "Error occurred when creating program category" });
  }
}

/**
 * Updates an existing program category by its ID
 * 
 * @route PUT /api/program-categories/:id
 * @access Admin
 * @param {Request} req - Express request object with category ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated category details
 * @throws {404} If category is not found
 * @throws {500} If server error occurs
 */
export const updateProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { CategoryName, Description } = req.body;
    console.log(`Updating program category with ID: ${id}`, req.body);

    const pool = await poolPromise;
    // Update category details
    const result = await pool.request()
      .input('id', id)
      .input('CategoryName', CategoryName)
      .input('Description', Description)
      .query(`
                UPDATE ProgramCategory
                SET 
                    CategoryName = @CategoryName,
                    Description = @Description
                WHERE CategoryID = @id AND IsDisabled = 0;
            `);

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Program category not found or already disabled" });
      return;
    }

    console.log("Program category updated successfully");

    // Fetch the updated category details
    const updatedCategoryResult = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id
            `);

    res.status(200).json(updatedCategoryResult.recordset[0]);
  } catch (error) {
    console.error("Error updating program category:", error);
    res.status(500).json({ message: "Error occurred when updating program category" });
  }
}

/**
 * Deletes a specific program category by its ID
 * Marks the category as disabled instead of deleting it
 * 
 * @route DELETE /api/program-categories/:id
 * @access Admin
 * @param {Request} req - Express request object with category ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with success message
 * @throws {404} If category is not found
 * @throws {500} If server error occurs
 */
export const deleteProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Deleting program category with ID: ${id}...`);

    const pool = await poolPromise;
    // Update category to mark as disabled
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE ProgramCategory
                SET IsDisabled = 1
                WHERE CategoryID = @id AND IsDisabled = 0;
            `);

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Program category not found or already disabled" });
      return;
    }

    console.log("Program category deleted successfully");
    res.status(200).json({ message: "Program category deleted successfully" });
  } catch (error) {
    console.error("Error deleting program category:", error);
    res.status(500).json({ message: "Error occurred when deleting program category" });
  }
}

/**
 * Retrieves all programs for a specific category ID
 * 
 * @route GET /api/programs/category/:categoryId
 * @access Public
 * @param {Request} req - Express request object with category ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of programs for the category
 * @throws {500} If database error occurs
 */
export const getProgramsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    console.log(`Fetching programs for category ID: ${categoryId}...`);

    const pool = await poolPromise;
    // Query programs for specific category
    const result = await pool.request()
      .input('categoryId', categoryId)
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
                WHERE CategoryID = @category
                AND IsDisabled = 0
                ORDER BY Date DESC
            `);
    console.log("Programs for category fetched:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching programs by category:", error);
    res.status(500).json({ message: "Error occurred when fetching programs by category" });
  }
}

