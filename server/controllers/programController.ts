import { Request, Response } from "express";
import { sql, poolPromise } from "../config/database";
import { createZoomMeeting, deleteZoomMeeting } from "./zoomController";
import { CommunityProgram } from "../types/type";

/**
 * Tự động tạo survey mapping cho chương trình mới
 * @param programId - ID của chương trình  
 * @returns Promise<boolean> - true nếu thành công
 */
export async function autoCreateSurveyMapping(programId: number): Promise<boolean> {
  try {
    const pool = await poolPromise;
    
    // Lấy danh sách survey mặc định (before/after)
    const surveyResult = await pool.request()
      .query(`
        SELECT SurveyID, Description 
        FROM Survey 
        WHERE SurveyCategoryID = 1 
        ORDER BY SurveyID
      `);

    const surveys = surveyResult.recordset;
    
    if (surveys.length < 2) {
      console.error('Not enough default surveys found. Expected at least 2, found:', surveys.length);
      return false;
    }

    // Survey đầu tiên là "before", survey thứ hai là "after"
    const beforeSurvey = surveys[0];
    const afterSurvey = surveys[1];

    // Kiểm tra xem đã có mapping chưa
    const existingMapping = await pool.request()
      .input('ProgramID', sql.Int, programId)
      .query(`
        SELECT COUNT(*) as count 
        FROM CommunityProgramSurvey 
        WHERE ProgramID = @ProgramID
      `);

    if (existingMapping.recordset[0].count > 0) {
      console.log(`Survey mapping already exists for program ${programId}`);
      return true;
    }

    // Tạo mapping cho before survey
    await pool.request()
      .input('SurveyID', sql.Int, beforeSurvey.SurveyID)
      .input('ProgramID', sql.Int, programId)
      .input('Type', sql.NVarChar, 'content')
      .input('SurveyType', sql.NVarChar, 'before')
      .query(`
        INSERT INTO CommunityProgramSurvey (SurveyID, ProgramID, Type, SurveyType)
        VALUES (@SurveyID, @ProgramID, @Type, @SurveyType)
      `);

    // Tạo mapping cho after survey
    await pool.request()
      .input('SurveyID', sql.Int, afterSurvey.SurveyID)
      .input('ProgramID', sql.Int, programId)
      .input('Type', sql.NVarChar, 'content')
      .input('SurveyType', sql.NVarChar, 'after')
      .query(`
        INSERT INTO CommunityProgramSurvey (SurveyID, ProgramID, Type, SurveyType)
        VALUES (@SurveyID, @ProgramID, @Type, @SurveyType)
      `);

    console.log(`Auto-created survey mappings for program ${programId}: before (${beforeSurvey.SurveyID}) and after (${afterSurvey.SurveyID})`);
    return true;

  } catch (error) {
    console.error('Error in autoCreateSurveyMapping:', error);
    return false;
  }
}

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
                MeetingRoomName,
                ZoomLink,
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
    res.status(500).json({ message: "Lỗi máy chủ" });
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
                SELECT ProgramID, ProgramName, Type, Date, Description, Content, Organizer, MeetingRoomName, ZoomLink, ImageUrl, IsDisabled, Status
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
        message: "Không thể thêm chương trình với ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi." 
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
      .input('MeetingRoomName', sql.NVarChar, zoomMeeting.meeting_id)
      .input('ZoomLink', sql.NVarChar, zoomMeeting.join_url)
      .input('ImageUrl', sql.NVarChar, ImageUrl || null)
      .input('Status', sql.NVarChar, Status || 'upcoming')
      .input('IsDisabled', sql.Bit, IsDisabled || false)
      .query(`
                INSERT INTO CommunityProgram 
                (ProgramName, Type, Date, Description, Content, Organizer, MeetingRoomName, ZoomLink, ImageUrl, Status, IsDisabled)
                OUTPUT INSERTED.ProgramID
                VALUES (@ProgramName, @Type, @Date, @Description, @Content, @Organizer, @MeetingRoomName, @ZoomLink, @ImageUrl, @Status, @IsDisabled)
            `);
    
    const newProgramId = insertResult.recordset[0].ProgramID;

    // Tự động tạo survey mapping cho chương trình mới
    console.log(`Auto-creating survey mappings for program ${newProgramId}...`);
    
    try {
      const success = await autoCreateSurveyMapping(newProgramId);
      if (success) {
        console.log(`Survey mapping created successfully for program ${newProgramId}`);
      } else {
        console.warn(`Failed to create survey mapping for program ${newProgramId}`);
      }
    } catch (surveyError) {
      console.error('Error creating survey mappings:', surveyError);
      // Không fail việc thêm chương trình nếu survey mapping lỗi
    }

    const result = await pool.request()
      .input('Id', sql.Int, newProgramId)
      .query('SELECT * FROM CommunityProgram WHERE ProgramID = @Id');
    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    console.error('Có lỗi xảy ra khi thêm chương trình:', err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
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
    res.status(500).json({ message: "Lỗi máy chủ" });
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
      // 1. Xóa tất cả survey responses liên quan đến chương trình
      await transaction.request()
        .input('ProgramId', sql.Int, id)
        .query('DELETE FROM SurveyResponse WHERE ProgramID = @ProgramId');

      // 2. Xóa tất cả attendees của chương trình
      await transaction.request()
        .input('ProgramId', sql.Int, id)
        .query('DELETE FROM CommunityProgramAttendee WHERE ProgramID = @ProgramId');

      // 3. Xóa tất cả surveys liên quan đến chương trình (nếu có)
      await transaction.request()
        .input('ProgramId', sql.Int, id)
        .query('DELETE FROM CommunityProgramSurvey WHERE ProgramID = @ProgramId');

      // 4. Xóa chương trình
      await transaction.request()
        .input('Id', sql.Int, id)
        .query('DELETE FROM CommunityProgram WHERE ProgramID = @Id');

      // Commit transaction
      await transaction.commit();

      // 5. Xóa Zoom meeting (sau khi đã commit database)
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
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Tự động tạo survey mapping cho tất cả chương trình chưa có mapping (Admin only)
 * @route POST /api/program/backfill-surveys
 * @access Admin
 */
export async function backfillSurveyMappings(req: Request, res: Response): Promise<void> {
  try {
    const pool = await poolPromise;
    
    // Tìm các chương trình chưa có survey mapping
    const programsWithoutSurvey = await pool.request()
      .query(`
        SELECT cp.ProgramID, cp.ProgramName
        FROM CommunityProgram cp
        LEFT JOIN CommunityProgramSurvey cps ON cp.ProgramID = cps.ProgramID
        WHERE cps.ProgramID IS NULL AND cp.IsDisabled = 0
      `);

    const programs = programsWithoutSurvey.recordset;
    console.log(`📝 Found ${programs.length} programs without survey mappings`);

    let successCount = 0;
    for (const program of programs) {
      const success = await autoCreateSurveyMapping(program.ProgramID);
      if (success) {
        successCount++;
        console.log(`Created survey mapping for program: ${program.ProgramName} (ID: ${program.ProgramID})`);
      } else {
        console.error(`Failed to create survey mapping for program: ${program.ProgramName} (ID: ${program.ProgramID})`);
      }
    }

    console.log(`Backfill completed: ${successCount}/${programs.length} programs processed successfully`);
    
    res.status(200).json({
      success: true,
      message: `Successfully created survey mappings for ${successCount} programs`,
      total: programs.length,
      backfilledCount: successCount,
      details: programs.map(p => ({ 
        programId: p.ProgramID, 
        programName: p.ProgramName 
      }))
    });

  } catch (error) {
    console.error('Error in backfillSurveyMappings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to backfill survey mappings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Tạo lại link Zoom mới cho chương trình (Admin only)
 * @route POST /api/program/:id/regenerate-zoom
 * @access Admin
 */
export async function regenerateZoomLink(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    
    // Lấy thông tin chương trình hiện tại
    const programResult = await pool.request()
      .input('ProgramID', sql.Int, id)
      .query(`
        SELECT ProgramID, ProgramName, Date, Description, MeetingRoomName
        FROM CommunityProgram 
        WHERE ProgramID = @ProgramID AND IsDisabled = 0
      `);

    if (programResult.recordset.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy chương trình' 
      });
      return;
    }

    const program = programResult.recordset[0];
    
    // Xóa meeting Zoom cũ nếu có
    if (program.MeetingRoomName) {
      try {
        await deleteZoomMeeting(program.MeetingRoomName);
        console.log(`Deleted old Zoom meeting: ${program.MeetingRoomName}`);
      } catch (error) {
        console.warn('Failed to delete old Zoom meeting:', error);
        // Tiếp tục tạo meeting mới dù xóa meeting cũ thất bại
      }
    }

    // Tạo meeting Zoom mới
    // Convert Date object to string format that createZoomMeeting expects
    let dateString: string;
    if (program.Date instanceof Date) {
      // Format as YYYY-MM-DD for createZoomMeeting
      dateString = program.Date.toISOString().split('T')[0];
    } else {
      dateString = program.Date;
    }
    
    const programData = {
      ProgramID: program.ProgramID,
      ProgramName: program.ProgramName,
      Date: dateString,
      Description: program.Description
    };

    const { join_url, meeting_id } = await createZoomMeeting(programData as CommunityProgram);

    // Cập nhật thông tin Zoom mới vào database
    await pool.request()
      .input('ProgramID', sql.Int, id)
      .input('MeetingRoomName', sql.NVarChar, meeting_id)
      .input('ZoomLink', sql.NVarChar, join_url)
      .query(`
        UPDATE CommunityProgram 
        SET MeetingRoomName = @MeetingRoomName, ZoomLink = @ZoomLink
        WHERE ProgramID = @ProgramID
      `);

    console.log(`Generated new Zoom link for program ${id}: ${join_url}`);

    res.status(200).json({
      success: true,
      message: 'Tạo link Zoom mới thành công',
      data: {
        meetingId: meeting_id,
        joinUrl: join_url
      }
    });

  } catch (error) {
    console.error('Error regenerating Zoom link:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo link Zoom mới'
    });
  }
}