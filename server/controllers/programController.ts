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
  const { ProgramName, date, Description, Content, Organizer, ImageUrl, Status, IsDisabled } = req.body;
  try {
    const pool = await poolPromise;

    // Convert date from dd/mm/yyyy to proper format for SQL Server
    let formattedDate;
    if (date && date.includes('/')) {
      const [day, month, year] = date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = date;
    }

    // Validate date is not in the past
    const programDate = new Date(formattedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
    
    if (programDate < today) {
      res.status(400).json({ 
        message: "Không thể tạo chương trình với ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi." 
      });
      return;
    }

    console.log('Original Date:', date);
    console.log('Formatted Date for SQL:', formattedDate);
    console.log('Program Date:', programDate);
    console.log('Today:', today);

    // Tạo cuộc họp Zoom
    const program: CommunityProgram = {
      ProgramID: 0,
      ProgramName,
      Type: 'online',
      Date: formattedDate, // Use formatted date for Zoom API
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
      .input('Date', sql.DateTime, formattedDate)
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
  const { ProgramName, date, Description, Content, Organizer, ImageUrl, Status, IsDisabled } = req.body;
  try {
    const pool = await poolPromise;

    // Convert date from dd/mm/yyyy to proper format for SQL Server
    let formattedDate;
    if (date && date.includes('/')) {
      const [day, month, year] = date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = date;
    }

    // Validate date is not in the past
    const programDate = new Date(formattedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
    
    if (programDate < today) {
      res.status(400).json({ 
        message: "Không thể cập nhật chương trình với ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi." 
      });
      return;
    }

    console.log('Original Date:', date);
    console.log('Formatted Date for SQL:', formattedDate);
    console.log('Program Date:', programDate);
    console.log('Today:', today);

    // Cập nhật chương trình (không tạo lại Zoom meeting)
    const updateResult = await pool.request()
      .input('Id', sql.Int, id)
      .input('ProgramName', sql.NVarChar, ProgramName)
      .input('Type', sql.NVarChar, 'online')
      .input('Date', sql.DateTime, formattedDate)
      .input('Description', sql.NVarChar, Description || null)
      .input('Content', sql.NVarChar, Content || null)
      .input('Organizer', sql.NVarChar, Organizer || null)
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
    
    if (programResult.recordset.length === 0) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    const meetingId = programResult.recordset[0].MeetingRoomName;

    // Bắt đầu transaction để đảm bảo tính nhất quán
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // 1. Xóa tất cả attendees của chương trình
      await transaction.request()
        .input('ProgramId', sql.Int, id)
        .query('DELETE FROM CommunityProgramAttendee WHERE ProgramID = @ProgramId');

      // 2. Xóa tất cả surveys liên quan đến chương trình (nếu có)
      await transaction.request()
        .input('ProgramId', sql.Int, id)
        .query('DELETE FROM CommunityProgramSurvey WHERE ProgramID = @ProgramId');

      // 3. Xóa chương trình
      await transaction.request()
        .input('Id', sql.Int, id)
        .query('DELETE FROM CommunityProgram WHERE ProgramID = @Id');

      // Commit transaction
      await transaction.commit();

      // 4. Xóa Zoom meeting (sau khi đã commit database)
      if (meetingId) {
        try {
          await deleteZoomMeeting(meetingId);
        } catch (zoomError) {
          console.warn('Could not delete Zoom meeting:', zoomError);
          // Không fail toàn bộ operation nếu Zoom API lỗi
        }
      }

      res.status(204).send();
    } catch (transactionError) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw transactionError;
    }
  } catch (err: any) {
    console.error('Có lỗi xảy ra khi xóa chương trình:', err.message);
    res.status(500).json({ message: "Server error" });
  }
}