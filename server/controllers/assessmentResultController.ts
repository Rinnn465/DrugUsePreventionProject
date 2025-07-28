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
        
        const pool = await poolPromise;
        const request = pool.request();

        // Kiểm tra xem đã có bản ghi nào cho (AccountID, AssessmentID) chưa
        const checkQuery = `
            SELECT ResultID 
            FROM AssessmentResults 
            WHERE AccountID = @AccountID AND AssessmentID = @AssessmentID;
        `;
        request.input('AccountID', sql.Int, account_id);
        request.input('AssessmentID', sql.Int, assessment_id);
        const checkResult = await request.query(checkQuery);
        

        if (checkResult.recordset.length > 0) {
            // Cập nhật bản ghi cũ
            const resultId = checkResult.recordset[0].ResultID;
            const updateQuery = `
                UPDATE AssessmentResults 
                SET Score = @Score, RiskLevel = @RiskLevel, CreatedAt = GETDATE()
                WHERE ResultID = @ResultID;
            `;
            request.input('ResultID', sql.Int, resultId);
            request.input('Score', sql.Int, score);
            request.input('RiskLevel', sql.NVarChar, risk_level);

            

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
                VALUES (@AccountID, @AssessmentID, @Score, @RiskLevel);
                SELECT SCOPE_IDENTITY() as id;
            `;
            request.input('Score', sql.Int, score);
            request.input('RiskLevel', sql.NVarChar, risk_level);

            

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

export const getAssessmentResult = async (req: Request, res: Response): Promise<void> => {
    const { resultId } = req.params;

    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        const query = `
            SELECT ResultID, AccountID, AssessmentID, Score, RiskLevel, CreatedAt
            FROM AssessmentResults
            WHERE ResultID = @resultId;
        `;
        
        request.input('resultId', sql.Int, parseInt(resultId));
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy kết quả đánh giá' });
            return;
        }
        
        res.status(200).json({ 
            message: 'Lấy kết quả đánh giá thành công',
            data: result.recordset[0]
        });
    } catch (error: any) {
        console.error('Lỗi khi lấy kết quả đánh giá:', error.message);
        res.status(500).json({ 
            error: 'Không thể lấy kết quả đánh giá',
            details: error.message
        });
    }
};

export const deleteAssessmentResult = async (req: Request, res: Response): Promise<void> => {
    const { resultId } = req.params;

    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        const query = `DELETE FROM AssessmentResults WHERE ResultID = @resultId;`;
        request.input('resultId', sql.Int, parseInt(resultId));
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ error: 'Không tìm thấy kết quả đánh giá để xóa' });
            return;
        }
        
        res.status(200).json({ 
            message: 'Xóa kết quả đánh giá thành công'
        });
    } catch (error: any) {
        console.error('Lỗi khi xóa kết quả đánh giá:', error.message);
        res.status(500).json({ 
            error: 'Không thể xóa kết quả đánh giá',
            details: error.message
        });
    }
};

export const getAssessmentResultByAssessment = async (req: Request, res: Response): Promise<void> => {
    const { assessmentId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        res.status(401).json({ error: 'Token không hợp lệ' });
        return;
    }

    try {
        // Decode token để lấy accountId
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const accountId = payload.user?.AccountID;
        
        if (!accountId) {
            res.status(401).json({ error: 'Token không chứa thông tin tài khoản' });
            return;
        }

        const pool = await poolPromise;
        const request = pool.request();
        
        const query = `
            SELECT ResultID, AccountID, AssessmentID, Score, RiskLevel, CreatedAt
            FROM AssessmentResults
            WHERE AssessmentID = @assessmentId AND AccountID = @accountId
            ORDER BY CreatedAt DESC;
        `;
        
        request.input('assessmentId', sql.Int, parseInt(assessmentId));
        request.input('accountId', sql.Int, accountId);
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy kết quả đánh giá' });
            return;
        }
        
        // Lấy kết quả mới nhất
        const latestResult = result.recordset[0];
        
        res.status(200).json({ 
            message: 'Lấy kết quả đánh giá thành công',
            data: {
                score: latestResult.Score,
                risk_level: latestResult.RiskLevel,
                created_at: latestResult.CreatedAt
            }
        });
    } catch (error: any) {
        console.error('Lỗi khi lấy kết quả đánh giá theo assessment:', error.message);
        res.status(500).json({ 
            error: 'Không thể lấy kết quả đánh giá',
            details: error.message
        });
    }
};