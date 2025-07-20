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

    // Sử dụng thời gian hiện tại của hệ thống (đã ở timezone chính xác)
    const currentTime = new Date();

    // Lưu response mới với JSON data
    await pool.request()
      .input('AccountID', sql.Int, accountId)
      .input('ProgramID', sql.Int, programId)
      .input('SurveyType', sql.NVarChar, surveyType)
      .input('ResponseData', sql.NVarChar, JSON.stringify(surveyData))
      .input('CreatedAt', sql.DateTime2, currentTime)
      .query(`
                INSERT INTO SurveyResponse (AccountID, ProgramID, SurveyType, ResponseData, CreatedAt)
                VALUES (@AccountID, @ProgramID, @SurveyType, @ResponseData, @CreatedAt)
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

/**
 * Lấy phản hồi khảo sát của người dùng theo chương trình
 * @route GET /api/survey/responses/:programId/:accountId
 * @access Admin, Staff
 */
export async function getSurveyResponsesByUser(
  req: Request,
  res: Response
): Promise<void> {
  const programId = Number(req.params.programId);
  const accountId = Number(req.params.accountId);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProgramID', sql.Int, programId)
      .input('AccountID', sql.Int, accountId)
      .query(`
        SELECT 
          sr.ResponseID,
          sr.SurveyType,
          sr.ResponseData,
          sr.CreatedAt,
          a.FullName,
          a.Email,
          cp.ProgramName
        FROM SurveyResponse sr
        INNER JOIN Account a ON sr.AccountID = a.AccountID
        INNER JOIN CommunityProgram cp ON sr.ProgramID = cp.ProgramID
        WHERE sr.ProgramID = @ProgramID AND sr.AccountID = @AccountID
        ORDER BY sr.SurveyType, sr.CreatedAt DESC
      `);

    // Xử lý dữ liệu để thêm ProcessedData
    const processedResults = result.recordset.map(response => {
      try {
        const parsedData = JSON.parse(response.ResponseData);
        
        // Tạo mapping cho các giá trị để hiển thị text thay vì value
        const processedData = Object.keys(parsedData).reduce((acc, key) => {
          const value = parsedData[key];
          
          // Mapping cho các câu hỏi phổ biến
          let displayValue = value;
          
          // Mapping cho scale questions (1-5, strongly-disagree to strongly-agree, etc.)
          if (typeof value === 'string') {
            // Special handling for overallSatisfaction field (star rating)
            if (key === 'overallSatisfaction') {
              const starMappings: { [key: string]: string } = {
                '1': '1 sao - Rất kém',
                '2': '2 sao - Kém', 
                '3': '3 sao - Bình thường',
                '4': '4 sao - Tốt',
                '5': '5 sao - Xuất sắc'
              };
              displayValue = starMappings[value] || value;
            } else {
              // General mappings for other fields
              const mappings: { [key: string]: string } = {
                // Agreement scale
                'strongly-disagree': 'Rất không đồng ý',
                'disagree': 'Không đồng ý',
                'neutral': 'Trung lập', 
                'agree': 'Đồng ý',
                'strongly-agree': 'Rất đồng ý',
              
              // Satisfaction scale
              'very-poor': 'Rất kém',
              'poor': 'Kém',
              'fair': 'Trung bình',
              'good': 'Tốt',
              'excellent': 'Xuất sắc',
              
              // Likelihood scale
              'very-unlikely': 'Rất không có khả năng',
              'unlikely': 'Không có khả năng',
              'neutral-likelihood': 'Trung lập',
              'likely': 'Có khả năng',
              'very-likely': 'Rất có khả năng',
              
              // Frequency scale
              'never': 'Không bao giờ',
              'rarely': 'Hiếm khi',
              'sometimes': 'Thỉnh thoảng',
              'often': 'Thường xuyên',
              'always': 'Luôn luôn',
              
              // Improvement scale
              'much-worse': 'Tệ hơn nhiều',
              'worse': 'Tệ hơn',
              'same': 'Như cũ',
              'better': 'Tốt hơn',
              'much-better': 'Tốt hơn nhiều',
              
              // Yes/No
              'yes': 'Có',
              'no': 'Không',
              'maybe': 'Có thể',
              
              // Occupation mappings
              'student': 'Học sinh',
              'university_student': 'Sinh viên',
              'teacher': 'Giáo viên/Giảng viên',
              'parent': 'Phụ huynh',
              'healthcare_worker': 'Nhân viên y tế',
              'government_officer': 'Cán bộ nhà nước',
              'ngo_volunteer': 'Tình nguyện viên',
              'other': 'Khác',
              
              // Other common values
              'hehe': 'Hehe',
              'very-satisfied': 'Rất hài lòng',
              'satisfied': 'Hài lòng',
              'dissatisfied': 'Không hài lòng',
              'very-dissatisfied': 'Rất không hài lòng'
            };
            
            displayValue = mappings[value as keyof typeof mappings] || value;
            }
          }
          
          acc[key] = {
            value: value,
            displayText: displayValue
          };
          
          return acc;
        }, {} as any);
        
        return {
          ...response,
          ResponseData: parsedData, // Raw data
          ProcessedData: processedData // Processed data with display text
        };
        
      } catch (parseError: any) {
        console.warn('Could not parse response data as JSON:', parseError.message);
        return {
          ...response,
          ProcessedData: null
        };
      }
    });

    res.json(processedResults);
  } catch (err) {
    console.error('Error fetching survey responses:', err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Lấy tất cả phản hồi khảo sát của một chương trình
 * @route GET /api/survey/responses/program/:programId
 * @access Admin, Staff
 */
export async function getSurveyResponsesByProgram(
  req: Request,
  res: Response
): Promise<void> {
  const programId = Number(req.params.programId);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProgramID', sql.Int, programId)
      .query(`
        SELECT 
          sr.ResponseID,
          sr.AccountID,
          sr.SurveyType,
          sr.ResponseData,
          sr.CreatedAt,
          a.FullName,
          a.Email,
          a.Username,
          cp.ProgramName
        FROM SurveyResponse sr
        INNER JOIN Account a ON sr.AccountID = a.AccountID
        INNER JOIN CommunityProgram cp ON sr.ProgramID = cp.ProgramID
        WHERE sr.ProgramID = @ProgramID
        ORDER BY a.FullName, sr.SurveyType, sr.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching program survey responses:', err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Thống kê phản hồi khảo sát theo chương trình
 * @route GET /api/survey/responses/program/:programId/statistics
 * @access Admin, Staff
 */
export async function getSurveyResponseStatistics(
  req: Request,
  res: Response
): Promise<void> {
  const programId = Number(req.params.programId);

  try {
    const pool = await poolPromise;
    
    // Thống kê tổng số người tham gia và số người đã làm khảo sát
    const statsResult = await pool.request()
      .input('ProgramID', sql.Int, programId)
      .query(`
        SELECT 
          COUNT(DISTINCT cpa.AccountID) as TotalAttendees,
          COUNT(DISTINCT CASE WHEN sr_before.SurveyType = 'before' THEN sr_before.AccountID END) as BeforeSurveyCount,
          COUNT(DISTINCT CASE WHEN sr_after.SurveyType = 'after' THEN sr_after.AccountID END) as AfterSurveyCount,
          cp.ProgramName,
          cp.Status as ProgramStatus
        FROM CommunityProgramAttendee cpa
        INNER JOIN CommunityProgram cp ON cpa.ProgramID = cp.ProgramID
        LEFT JOIN SurveyResponse sr_before ON cpa.AccountID = sr_before.AccountID 
          AND cpa.ProgramID = sr_before.ProgramID 
          AND sr_before.SurveyType = 'before'
        LEFT JOIN SurveyResponse sr_after ON cpa.AccountID = sr_after.AccountID 
          AND cpa.ProgramID = sr_after.ProgramID 
          AND sr_after.SurveyType = 'after'
        WHERE cpa.ProgramID = @ProgramID
        GROUP BY cp.ProgramName, cp.Status
      `);

    res.json(statsResult.recordset[0] || {
      TotalAttendees: 0,
      BeforeSurveyCount: 0,
      AfterSurveyCount: 0,
      ProgramName: '',
      ProgramStatus: ''
    });
  } catch (err) {
    console.error('Error fetching survey statistics:', err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Lấy phản hồi khảo sát cụ thể của một người dùng
 * @route GET /api/survey/responses/:programId/:accountId/:surveyType
 * @access Admin
 */
export async function getSurveyResponseByUserAndType(req: Request, res: Response): Promise<void> {
  const programId = Number(req.params.programId);
  const accountId = Number(req.params.accountId);
  const surveyType = req.params.surveyType;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProgramID', sql.Int, programId)
      .input('AccountID', sql.Int, accountId)
      .input('SurveyType', sql.NVarChar, surveyType)
      .query(`
        SELECT 
          sr.ResponseID,
          sr.ResponseData,
          sr.CreatedAt,
          a.FullName,
          a.Username,
          a.Email,
          cp.ProgramName
        FROM SurveyResponse sr
        INNER JOIN Account a ON sr.AccountID = a.AccountID
        INNER JOIN CommunityProgram cp ON sr.ProgramID = cp.ProgramID
        WHERE sr.ProgramID = @ProgramID 
          AND sr.AccountID = @AccountID 
          AND sr.SurveyType = @SurveyType
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Không tìm thấy phản hồi khảo sát" });
      return;
    }

    const response = result.recordset[0];
    
    // Parse JSON response data
    try {
      const parsedData = JSON.parse(response.ResponseData);
      
      // Tạo mapping cho các giá trị để hiển thị text thay vì value
      const processedData = Object.keys(parsedData).reduce((acc, key) => {
        const value = parsedData[key];
        
        // Mapping cho các câu hỏi phổ biến
        let displayValue = value;
        
        // Mapping cho scale questions (1-5, strongly-disagree to strongly-agree, etc.)
        if (typeof value === 'string') {
          // Special handling for overallSatisfaction field (star rating)
          if (key === 'overallSatisfaction') {
            const starMappings: { [key: string]: string } = {
              '1': '1 sao - Rất kém',
              '2': '2 sao - Kém', 
              '3': '3 sao - Bình thường',
              '4': '4 sao - Tốt',
              '5': '5 sao - Xuất sắc'
            };
            displayValue = starMappings[value] || value;
          } else {
            // General mappings for other fields
            const mappings: { [key: string]: string } = {
              // Agreement scale
              'strongly-disagree': 'Rất không đồng ý',
              'disagree': 'Không đồng ý',
              'neutral': 'Trung lập', 
              'agree': 'Đồng ý',
              'strongly-agree': 'Rất đồng ý',
            
            // Satisfaction scale
            'very-poor': 'Rất kém',
            'poor': 'Kém',
            'fair': 'Trung bình',
            'good': 'Tốt',
            'excellent': 'Xuất sắc',
            
            // Likelihood scale
            'very-unlikely': 'Rất không có khả năng',
            'unlikely': 'Không có khả năng',
            'neutral-likelihood': 'Trung lập',
            'likely': 'Có khả năng',
            'very-likely': 'Rất có khả năng',
            
            // Frequency scale
            'never': 'Không bao giờ',
            'rarely': 'Hiếm khi',
            'sometimes': 'Thỉnh thoảng',
            'often': 'Thường xuyên',
            'always': 'Luôn luôn',
            
            // Improvement scale
            'much-worse': 'Tệ hơn nhiều',
            'worse': 'Tệ hơn',
            'same': 'Như cũ',
            'better': 'Tốt hơn',
            'much-better': 'Tốt hơn nhiều',
            
            // Yes/No
            'yes': 'Có',
            'no': 'Không',
            'maybe': 'Có thể',
            
            // Other common values
            'hehe': 'Hehe',
            'very-satisfied': 'Rất hài lòng',
            'satisfied': 'Hài lòng',
            'dissatisfied': 'Không hài lòng',
            'very-dissatisfied': 'Rất không hài lòng'
          };
          
          displayValue = mappings[value as keyof typeof mappings] || value;
          }
        }
        
        acc[key] = {
          value: value,
          displayText: displayValue
        };
        
        return acc;
      }, {} as any);
      
      response.ResponseData = parsedData; // Raw data
      response.ProcessedData = processedData; // Processed data with display text
      
    } catch (parseError: any) {
      console.warn('Could not parse response data as JSON:', parseError.message);
      // Giữ nguyên dữ liệu gốc nếu không parse được
    }

    res.json(response);
  } catch (err) {
    console.error('Error fetching survey response:', err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
