import { Request, Response } from "express";
import { sql, poolPromise } from "../config/database";

export const getAllPrograms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Fetching all programs from database...");
    const pool = await poolPromise;
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Content,
                Organizer,
                Url,
                ImageUrl,
                IsDisabled,
                Status
            FROM CommunityProgram
            WHERE IsDisabled = 0
            ORDER BY Date DESC
        `);
    console.log("Programs fetched:", result.recordset);
    res.status(200).json({
      data: result.recordset,
      user: (req as any).user ? { ...(req as any).user.user } : null,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProgramById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Fetching program with ID: ${id}...`);

    const pool = await poolPromise;
    const result = await pool.request().input("id", id).query(`
                SELECT ProgramID, ProgramName, Type, Date, Description, Content, Organizer, Url, ImageUrl, IsDisabled, Status
                FROM CommunityProgram
                WHERE ProgramID = @id AND IsDisabled = 0
            `);

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

export async function createProgram(req: Request, res: Response): Promise<void> {
    const { ProgramName, date, Description, Content, Organizer, Url, ImageUrl, Status, IsDisabled } = req.body; 
    try {
        const pool = await poolPromise;
        const insertResult = await pool.request()
            .input('ProgramName', sql.NVarChar, ProgramName)
            .input('Type', sql.NVarChar, 'online') 
            .input('Date', sql.DateTime, date)
            .input('Description', sql.NVarChar, Description || null)
            .input('Content', sql.NVarChar, Content || null)
            .input('Organizer', sql.NVarChar, Organizer || null)
            .input('Url', sql.NVarChar, Url)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('Status', sql.NVarChar, Status || 'upcoming')
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`
                INSERT INTO CommunityProgram 
                (ProgramName, Type, Date, Description, Content, Organizer, Url, ImageUrl, Status, IsDisabled)
                OUTPUT INSERTED.ProgramID
                VALUES (@ProgramName, @Type, @Date, @Description, @Content, @Organizer, @Url, @ImageUrl, @Status, @IsDisabled)
            `);
        const newProgramId = insertResult.recordset[0].ProgramID;
        const result = await pool.request()
            .input('Id', sql.Int, newProgramId)
            .query('SELECT * FROM CommunityProgram WHERE ProgramID = @Id');
        res.status(201).json(result.recordset[0]);
    } catch (err: any) {
        console.error('Có lỗi xảy ra khi thêm chương trình:', err.message);
        res.status(500).json({ message: "Server error" });
    }
}

export async function updateProgram(req: Request, res: Response): Promise<void> {
    const { id } = req.params; Number(id);
    const { ProgramName, date, Description, Content, Organizer, Url, ImageUrl, Status, IsDisabled } = req.body; // Removed Type since it's always 'online'
    try {
        const pool = await poolPromise;
        const updateResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('ProgramName', sql.NVarChar, ProgramName)
            .input('Type', sql.NVarChar, 'online')
            .input('Date', sql.DateTime, date)
            .input('Description', sql.NVarChar, Description || null)
            .input('Content', sql.NVarChar, Content || null)
            .input('Organizer', sql.NVarChar, Organizer || null)
            .input('Url', sql.NVarChar, Url)
            .input('ImageUrl', sql.NVarChar, ImageUrl || null)
            .input('Status', sql.NVarChar, Status || 'upcoming')
            .input('IsDisabled', sql.Bit, IsDisabled)
            .query(`
                UPDATE CommunityProgram
                SET ProgramName = @ProgramName,
                    Type = @Type,
                    Date = @Date,
                    Description = @Description,
                    Content = @Content,
                    Organizer = @Organizer,
                    Url = @Url,
                    ImageUrl = @ImageUrl,
                    Status = @Status,
                    IsDisabled = @IsDisabled
                WHERE ProgramID = @Id
            `);
        if (updateResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Program not found" });
            return;
        }
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT * FROM CommunityProgram WHERE ProgramID = @Id');
        res.json(result.recordset[0]);
    } catch (err: any) {
        console.error('Có lỗi xảy ra khi cập nhật chương trình:', err.message);
        res.status(500).json({ message: "Server error" });
    }
}

export async function deleteProgram(req: Request, res: Response): Promise<void> {
    const { id } = req.params; // ✅ Changed from 'Id' to 'id' to match route parameter
    try {
        const pool = await poolPromise;
        const deleteResult = await pool.request()
            .input('Id', sql.Int, id) // ✅ Use 'id' from params
            .query('DELETE FROM CommunityProgram WHERE ProgramID = @Id');
        if (deleteResult.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Program not found" });
            return;
        }
        res.status(204).send();
    } catch (err: any) {
        console.error('Có lỗi xảy ra khi xoá chương trình:', err.message);
        res.status(500).json({ message: "Server error" });
    }
}