import { Request, Response } from "express";
import { sql, poolPromise } from "../config/database";
import { createZoomMeeting, deleteZoomMeeting } from "./zoomController";
import { CommunityProgram } from "../types/type";

export const getAllPrograms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
                MeetingRoomName,
                ImageUrl,
                IsDisabled,
                Status
            FROM CommunityProgram
            WHERE IsDisabled = 0
            ORDER BY Date DESC
        `);
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

    const pool = await poolPromise;
    const result = await pool.request().input("id", id).query(`
                SELECT ProgramID, ProgramName, Type, Date, Description, Content, Organizer, Url, MeetingRoomName, ImageUrl, IsDisabled, Status
                FROM CommunityProgram
                WHERE ProgramID = @id AND IsDisabled = 0
            `);

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

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
  const { ProgramName, Date, Description, Content, Organizer, ImageUrl, Status, IsDisabled } = req.body;
  try {
    const pool = await poolPromise;

    // Tạo cuộc họp Zoom
    const program: CommunityProgram = {
      ProgramID: 0,
      ProgramName,
      Type: 'online',
      Date,
      Description: Description || null,
      Content: Content || null,
      Organizer: Organizer || null,
      Url: '',
      ImageUrl: ImageUrl || null,
      IsDisabled: IsDisabled || false,
      Status: Status || 'upcoming'
    };
    const zoomMeeting = await createZoomMeeting(program);

    // Chèn chương trình vào cơ sở dữ liệu
    const insertResult = await pool.request()
      .input('ProgramName', sql.NVarChar, ProgramName)
      .input('Type', sql.NVarChar, 'online')
      .input('Date', sql.DateTime, Date)
      .input('Description', sql.NVarChar, Description || null)
      .input('Content', sql.NVarChar, Content || null)
      .input('Organizer', sql.NVarChar, Organizer || null)
      .input('Url', sql.NVarChar, zoomMeeting.join_url)
      .input('MeetingRoomName', sql.NVarChar, zoomMeeting.meeting_id)
      .input('ImageUrl', sql.NVarChar, ImageUrl || null)
      .input('Status', sql.NVarChar, Status || 'upcoming')
      .input('IsDisabled', sql.Bit, IsDisabled || false)
      .query(`
                INSERT INTO CommunityProgram 
                (ProgramName, Type, Date, Description, Content, Organizer, Url, MeetingRoomName, ImageUrl, Status, IsDisabled)
                OUTPUT INSERTED.ProgramID
                VALUES (@ProgramName, @Type, @Date, @Description, @Content, @Organizer, @Url, @MeetingRoomName, @ImageUrl, @Status, @IsDisabled)
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
  const { id } = req.params;
  const { ProgramName, Date, Description, Content, Organizer, ImageUrl, Status, IsDisabled } = req.body;
  try {
    const pool = await poolPromise;

    // Tạo lại cuộc họp Zoom
    const program: CommunityProgram = {
      ProgramID: Number(id),
      ProgramName,
      Type: 'online',
      Date,
      Description: Description || null,
      Content: Content || null,
      Organizer: Organizer || null,
      Url: '',
      ImageUrl: ImageUrl || null,
      IsDisabled: IsDisabled || false,
      Status: Status || 'upcoming'
    };
    const zoomMeeting = await createZoomMeeting(program);

    // Cập nhật chương trình
    const updateResult = await pool.request()
      .input('Id', sql.Int, id)
      .input('ProgramName', sql.NVarChar, ProgramName)
      .input('Type', sql.NVarChar, 'online')
      .input('Date', sql.DateTime, Date)
      .input('Description', sql.NVarChar, Description || null)
      .input('Content', sql.NVarChar, Content || null)
      .input('Organizer', sql.NVarChar, Organizer || null)
      .input('Url', sql.NVarChar, zoomMeeting.join_url)
      .input('MeetingRoomName', sql.NVarChar, zoomMeeting.meeting_id)
      .input('ImageUrl', sql.NVarChar, ImageUrl || null)
      .input('Status', sql.NVarChar, Status || 'upcoming')
      .input('IsDisabled', sql.Bit, IsDisabled || false)
      .query(`
                UPDATE CommunityProgram
                SET ProgramName = @ProgramName,
                    Type = @Type,
                    Date = @Date,
                    Description = @Description,
                    Content = @Content,
                    Organizer = @Organizer,
                    Url = @Url,
                    MeetingRoomName = @MeetingRoomName,
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
  const { id } = req.params;
  try {
    const pool = await poolPromise;

    // Lấy MeetingRoomName để xóa cuộc họp Zoom
    const programResult = await pool.request()
      .input('Id', sql.Int, id)
      .query('SELECT MeetingRoomName FROM CommunityProgram WHERE ProgramID = @Id');
    
    if (programResult.recordset.length > 0) {
      const meetingId = programResult.recordset[0].MeetingRoomName;
      if (meetingId) {
        await deleteZoomMeeting(meetingId);
      }
    }

    // Xóa chương trình
    const deleteResult = await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM CommunityProgram WHERE ProgramID = @Id');
    
    if (deleteResult.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Program not found" });
      return;
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('Có lỗi xảy ra khi xóa chương trình:', err.message);
    res.status(500).json({ message: "Server error" });
  }
}