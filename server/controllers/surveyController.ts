import { Request, Response } from "express";
import { sql, poolPromise } from "../config/database";

// GET ALL Surveys (with SurveyCategoryName)
export async function getAllSurveys(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
        `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

// GET Survey by ID (with SurveyCategoryName)
export async function getSurveyById(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, id).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    const survey = result.recordset[0];
    if (!survey) {
      res.status(404).json({ message: "Không tìm thấy bài khảo sát" });
      return;
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

export const submitSurveyResponse = async (req: Request, res: Response): Promise<void> => {
  const { programId, surveyType, surveyData } = req.body;

  // Lấy accountId từ JWT token thay vì từ request body để bảo mật
  const accountId = (req as any).user?.user?.AccountID;

  // Thêm logging chi tiết
  console.log('=== SUBMIT SURVEY DEBUG ===');
  console.log('Request body:', req.body);
  console.log('AccountID from token:', accountId);
  console.log('ProgramID:', programId);
  console.log('SurveyType:', surveyType);
  console.log('SurveyData:', surveyData);

  try {
    const pool = await poolPromise;

    // Kiểm tra user có tồn tại không
    if (!accountId) {
      console.log('No AccountID found in user token');
      res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    // Kiểm tra dữ liệu đầu vào
    if (!programId || !surveyType || !surveyData) {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      return;
    }

    // Kiểm tra người dùng đã đăng ký tham gia chương trình chưa
    const enrollmentCheck = await pool.request()
      .input('AccountID', sql.Int, accountId)
      .input('ProgramID', sql.Int, programId)
      .query(`
        SELECT Status FROM CommunityProgramAttendee 
        WHERE AccountID = @AccountID AND ProgramID = @ProgramID
      `);

    if (enrollmentCheck.recordset.length === 0) {
      console.log('User not enrolled in program');
      res.status(403).json({ message: 'Bạn chưa đăng ký tham gia chương trình này' });
      return;
    }

    // Nếu là khảo sát sau chương trình, kiểm tra chương trình đã kết thúc chưa
    if (surveyType === 'after') {
      const programStatusCheck = await pool.request()
        .input('ProgramID', sql.Int, programId)
        .query(`
          SELECT Status FROM CommunityProgram 
          WHERE ProgramID = @ProgramID
        `);

      if (programStatusCheck.recordset.length === 0) {
        console.log('Program not found');
        res.status(404).json({ message: 'Không tìm thấy chương trình' });
        return;
      }

      const programStatus = programStatusCheck.recordset[0].Status;
      if (programStatus !== 'completed') {
        console.log('Program not completed yet, status:', programStatus);
        res.status(403).json({ 
          message: 'Chỉ có thể làm khảo sát sau chương trình khi chương trình đã kết thúc',
          programStatus: programStatus
        });
        return;
      }
    }

    console.log('Checking for existing response...');

    // Kiểm tra xem user đã làm khảo sát này chưa
    const existingResponse = await pool.request()
      .input('AccountID', sql.Int, accountId)
      .input('ProgramID', sql.Int, programId)
      .input('SurveyType', sql.NVarChar, surveyType)
      .query(`
                SELECT ResponseID FROM SurveyResponse 
                WHERE AccountID = @AccountID AND ProgramID = @ProgramID AND SurveyType = @SurveyType
            `);

    console.log('Existing response check result:', existingResponse.recordset);

    if (existingResponse.recordset.length > 0) {
      console.log('Survey already completed');
      res.status(400).json({ message: 'Bạn đã hoàn thành khảo sát này rồi' });
      return;
    }

    console.log('Inserting new survey response...');

    // Lưu response mới với JSON data
    await pool.request()
      .input('AccountID', sql.Int, accountId)
      .input('ProgramID', sql.Int, programId)
      .input('SurveyType', sql.NVarChar, surveyType)
      .input('ResponseData', sql.NVarChar, JSON.stringify(surveyData))
      .query(`
                INSERT INTO SurveyResponse (AccountID, ProgramID, SurveyType, ResponseData)
                VALUES (@AccountID, @ProgramID, @SurveyType, @ResponseData)
            `);

    console.log('Survey response inserted successfully');

    console.log('Updating attendee status...');

    // Cập nhật trạng thái khảo sát trong CommunityProgramAttendee
    const updateField = surveyType === 'before' ? 'SurveyBeforeCompleted' : 'SurveyAfterCompleted';
    const updateResult = await pool.request()
      .input('AccountID', sql.Int, accountId)
      .input('ProgramID', sql.Int, programId)
      .query(`
                UPDATE CommunityProgramAttendee 
                SET ${updateField} = 1 
                WHERE AccountID = @AccountID AND ProgramID = @ProgramID
            `);

    console.log('Update result:', updateResult.rowsAffected);
    console.log('Survey submission completed successfully');

    res.status(201).json({
      message: 'Lưu khảo sát thành công'
    });

  } catch (error: any) {
    console.error('Error submitting survey response:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.originalError || 'No SQL error'
    });
    res.status(500).json({ message: 'Lỗi máy chủ khi lưu khảo sát', error: error.message });
  }
};

// CREATE Survey
export async function createSurvey(req: Request, res: Response): Promise<void> {
  const { Description, Type, SurveyCategoryID } = req.body;
  try {
    const pool = await poolPromise;
    const insertResult = await pool
      .request()
      .input("Description", sql.NVarChar, Description)
      .input("Type", sql.Bit, Type)
      .input(
        "SurveyCategoryID",
        SurveyCategoryID ? sql.Int : sql.Int,
        SurveyCategoryID || null
      ).query(`
                INSERT INTO Survey (Description, Type, SurveyCategoryID)
                OUTPUT INSERTED.SurveyID
                VALUES (@Description, @Type, @SurveyCategoryID)
            `);
    const newId = insertResult.recordset[0].SurveyID;
    // Return the created survey with category name
    const result = await pool.request().input("id", sql.Int, newId).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

// UPDATE Survey
export async function updateSurvey(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { Description, Type, SurveyCategoryID } = req.body;
  try {
    const pool = await poolPromise;
    const updateResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("Description", sql.NVarChar, Description)
      .input("Type", sql.Bit, Type)
      .input(
        "SurveyCategoryID",
        SurveyCategoryID ? sql.Int : sql.Int,
        SurveyCategoryID || null
      ).query(`
                UPDATE Survey
                SET Description = @Description, Type = @Type, SurveyCategoryID = @SurveyCategoryID
                WHERE SurveyID = @id
            `);
    if (updateResult.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy bài khảo sát" });
      return;
    }
    // Return the updated survey with category name
    const result = await pool.request().input("id", sql.Int, id).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

// DELETE Survey
export async function deleteSurvey(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const pool = await poolPromise;
    const deleteResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Survey WHERE SurveyID = @id");
    if (deleteResult.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy bài khảo sát" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

// GET Surveys by CategoryID (with SurveyCategoryName)
export async function getSurveyByCategoryId(
  req: Request,
  res: Response
): Promise<void> {
  const categoryId = Number(req.params.categoryId);
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("categoryId", sql.Int, categoryId)
      .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyCategoryID = @categoryId
            `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
