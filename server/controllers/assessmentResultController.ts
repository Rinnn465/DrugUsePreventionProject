import { Request, Response } from 'express';
import { sql, poolPromise } from '../config/database';

interface AssessmentResult {
    account_id: number;
    assessment_id: number;
    score: number;
    risk_level: string;
}

export const saveAssessmentResult = async (req: Request, res: Response): Promise<void> => {
    const { account_id, assessment_id, score, risk_level } = req.body as AssessmentResult;

    console.log('=== NHẬN YÊU CẦU POST ===');
    console.log('Dữ liệu nhận được:', JSON.stringify(req.body, null, 2));

    // Kiểm tra dữ liệu đầu vào
    if (!account_id || !assessment_id || score === undefined || !risk_level) {
        console.error('Lỗi: Thiếu trường bắt buộc trong dữ liệu');
        res.status(400).json({ 
            error: 'Thiếu các trường bắt buộc',
            details: 'Yêu cầu phải có: account_id, assessment_id, score, risk_level'
        });
        return;
    }

    try {
        console.log('Kết nối tới SQL Server bằng poolPromise...');
        const pool = await poolPromise;
        const request = pool.request();

        // Kiểm tra xem đã có bản ghi nào cho (AccountID, AssessmentID) chưa
        const checkQuery = `
            SELECT ResultID 
            FROM AssessmentResults 
            WHERE AccountID = @account_id AND AssessmentID = @assessment_id;
        `;
        request.input('account_id', sql.Int, account_id);
        request.input('assessment_id', sql.Int, assessment_id);
        const checkResult = await request.query(checkQuery);
        console.log('Kết quả kiểm tra bản ghi:', JSON.stringify(checkResult.recordset, null, 2));

        if (checkResult.recordset.length > 0) {
            // Cập nhật bản ghi cũ
            const resultId = checkResult.recordset[0].ResultID;
            const updateQuery = `
                UPDATE AssessmentResults 
                SET Score = @score, RiskLevel = @risk_level, CreatedAt = GETDATE()
                WHERE ResultID = @result_id;
            `;
            request.input('result_id', sql.Int, resultId);
            request.input('score', sql.Int, score);
            request.input('risk_level', sql.NVarChar, risk_level);

            console.log('Thực thi query cập nhật:', updateQuery);
            console.log('Tham số:', { result_id: resultId, score, risk_level });

            const updateResult = await request.query(updateQuery);
            if (updateResult.rowsAffected[0] === 0) {
                throw new Error('Không thể cập nhật bản ghi');
            }

            res.status(200).json({ 
                message: 'Cập nhật kết quả đánh giá thành công',
                id: resultId
            });
        } else {
            // Thêm bản ghi mới
            const insertQuery = `
                INSERT INTO AssessmentResults (AccountID, AssessmentID, Score, RiskLevel)
                VALUES (@account_id, @assessment_id, @score, @risk_level);
                SELECT SCOPE_IDENTITY() as id;
            `;
            request.input('score', sql.Int, score);
            request.input('risk_level', sql.NVarChar, risk_level);

            console.log('Thực thi query thêm mới:', insertQuery);
            console.log('Tham số:', { account_id, assessment_id, score, risk_level });

            const insertResult = await request.query(insertQuery);
            if (insertResult.rowsAffected[0] === 0) {
                throw new Error('Không có bản ghi nào được thêm vào database');
            }

            res.status(201).json({ 
                message: 'Lưu kết quả đánh giá thành công',
                id: insertResult.recordset[0].id
            });
        }
    } catch (error: any) {
        console.error('Lỗi khi lưu kết quả:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Không thể lưu kết quả vào database',
            details: error.message
        });
    }
};