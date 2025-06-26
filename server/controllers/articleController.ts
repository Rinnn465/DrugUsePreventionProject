import { Request, Response } from 'express';
import { poolPromise } from '../config/database';

/**
 * Interface đại diện cho một Bài viết trong cơ sở dữ liệu
 * Ánh xạ với cấu trúc bảng Article
 */
interface Article {
    BlogID: number;      // Mã định danh duy nhất cho bài viết
    AccountID: number;   // ID tài khoản tạo bài viết
    ArticleTitle: string; // Tiêu đề bài viết
    PublishedDate: Date; // Ngày xuất bản bài viết
    ImageUrl: string | null; // Đường dẫn ảnh đại diện (có thể không bắt buộc)
    Author: string;      // Tên tác giả bài viết
    Status: string;      // Trạng thái xuất bản (ví dụ: nháp, đã xuất bản)
    Content: string;     // Nội dung chính của bài viết
    IsDisabled: boolean; // Cờ để xóa mềm/vô hiệu hóa bài viết
}

/**
 * Lấy tất cả bài viết đang hoạt động từ cơ sở dữ liệu
 * Chỉ trả về các bài viết chưa bị vô hiệu hóa, sắp xếp theo ngày xuất bản
 *
 * @route GET /api/articles
 * @access Công khai
 * @returns {Promise<void>} Phản hồi JSON với mảng bài viết
 * @throws {500} Nếu có lỗi khi truy vấn cơ sở dữ liệu
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
        // Bắt đầu log quá trình lấy bài viết
        console.log("Đang lấy danh sách bài viết từ cơ sở dữ liệu...");
        // Lấy kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise; // Get database connection
        // Truy vấn lấy tất cả bài viết đang hoạt động, mới nhất lên đầu
        const result = await pool.request().query(`
            SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
            FROM Article
            WHERE IsDisabled = 0
            ORDER BY PublishedDate DESC
        `);
        // Log kết quả truy vấn
        console.log("Đã lấy bài viết:", result.recordset);
        // Trả về danh sách bài viết
        res.status(200).json(result.recordset);
    } catch (error: unknown) {
        // Xử lý lỗi truy vấn
        const message = error instanceof Error ? error.message : String(error);
        console.error("Lỗi khi lấy bài viết:", message);
        res.status(500).json({ message: "Có lỗi khi lấy bài viết" });
    }

}

/**
 * Lấy chi tiết một bài viết theo ID
 * Chỉ trả về bài viết nếu chưa bị vô hiệu hóa
 *
 * @route GET /api/articles/:id
 * @param id Mã BlogID của bài viết
 * @access Công khai
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài viết
 * @throws {400} Nếu ID bài viết không hợp lệ
 * @throws {404} Nếu không tìm thấy bài viết hoặc đã bị vô hiệu hóa
 */
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    // Log tham số request
    console.log(req.params);

    // Kiểm tra ID hợp lệ
    if (isNaN(articleId)) {
        res.status(400).json({ message: "ID bài viết không hợp lệ" });
        return;
    }
    try {
        // Log quá trình lấy bài viết theo ID
        console.log(`Đang lấy bài viết với ID: ${articleId}`);
        // Lấy kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise;
        // Truy vấn một bài viết với tham số hóa để đảm bảo an toàn
        const result = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID, AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        // Kiểm tra bài viết tồn tại và đang hoạt động
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
            return;
        }

        // Log bài viết lấy được
        console.log("Đã lấy bài viết:", result.recordset[0]);
        // Trả về chi tiết bài viết
        res.status(200).json(result.recordset[0]);
    } catch (error: unknown) {
        // Xử lý lỗi truy vấn
        const message = error instanceof Error ? error.message : String(error);
        console.error("Lỗi khi lấy bài viết:", message);
        res.status(500).json({ message: "Có lỗi khi lấy bài viết" });
    }
}

/**
 * Tạo mới một bài viết trong cơ sở dữ liệu
 *
 * @route POST /api/articles
 * @access Bảo vệ (yêu cầu xác thực)
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài viết vừa tạo
 * @throws {400} Nếu thiếu trường bắt buộc hoặc dữ liệu không hợp lệ
 * @throws {500} Nếu thao tác cơ sở dữ liệu thất bại
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
    const { AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content } = req.body;
    // Kiểm tra trường bắt buộc
    if (!AccountID || !ArticleTitle || !PublishedDate || !Author || !Status || !Content) {
        res.status(400).json({ message: "Thiếu trường bắt buộc" });
        return;
    }
    try {
        // Log quá trình tạo bài viết mới
        console.log("Tạo bài viết mới:", { ArticleTitle, Author });
        // Lấy kết nối tới pool cơ sở dữ liệu
        const pool = await poolPromise;
        // Thêm bài viết mới với truy vấn tham số hóa
        const result = await pool.request()
            .input('AccountID', AccountID)
            .input('ArticleTitle', ArticleTitle)
            .input('PublishedDate', new Date(PublishedDate)) // Ensure date is valid
            .input('ImageUrl', ImageUrl || null)
            .input('Author', Author)
            .input('Status', Status)
            .input('Content', Content)
            .input('IsDisabled', false)
            .query(`
                INSERT INTO Article (AccountID, ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content, IsDisabled)
                OUTPUT INSERTED.*
                VALUES (@AccountID, @ArticleTitle, @PublishedDate, @ImageUrl, @Author, @Status, @Content, @IsDisabled)
            `);
        // Trả về bài viết vừa tạo
        res.status(201).json(result.recordset[0]);
    } catch (error: unknown) {
        // Xử lý lỗi truy vấn
        const message = error instanceof Error ? error.message : String(error);
        console.error("Lỗi khi tạo bài viết:", message);
        res.status(500).json({ message: "Có lỗi khi tạo bài viết" });
    }
}

/**
 * Cập nhật một bài viết theo ID
 * Chỉ cập nhật các trường được cung cấp, giữ nguyên giá trị cũ nếu không truyền lên
 *
 * @route PUT /api/articles/:id
 * @param id Mã BlogID của bài viết
 * @access Bảo vệ (yêu cầu xác thực)
 * @returns {Promise<void>} Phản hồi JSON với chi tiết bài viết đã cập nhật
 * @throws {400} Nếu ID bài viết không hợp lệ
 * @throws {404} Nếu không tìm thấy bài viết hoặc đã bị vô hiệu hóa
 * @throws {500} Nếu thao tác cơ sở dữ liệu thất bại
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    const { ArticleTitle, PublishedDate, ImageUrl, Author, Status, Content } = req.body;

    // Kiểm tra ID hợp lệ
    if (isNaN(articleId)) {
        res.status(400).json({ message: "ID bài viết không hợp lệ" });
        return;
    }
    try {
        // Log quá trình cập nhật bài viết
        console.log(`Cập nhật bài viết với ID: ${articleId}`); // Log update attempt
        const pool = await poolPromise;

        // Kiểm tra bài viết tồn tại và chưa bị vô hiệu hóa
        const checkResult = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
            return;
        }

        // Xây dựng truy vấn cập nhật động dựa trên các trường được cung cấp
        const updates: string[] = [];
        const inputs: { name: string, value: any }[] = [];

        if (ArticleTitle) {
            updates.push('ArticleTitle = @ArticleTitle');
            inputs.push({ name: 'ArticleTitle', value: ArticleTitle });
        }
        if (PublishedDate) {
            updates.push('PublishedDate = @PublishedDate');
            inputs.push({ name: 'PublishedDate', value: new Date(PublishedDate) });
        }
        if (ImageUrl !== undefined) {
            updates.push('ImageUrl = @ImageUrl');
            inputs.push({ name: 'ImageUrl', value: ImageUrl });
        }
        if (Author) {
            updates.push('Author = @Author');
            inputs.push({ name: 'Author', value: Author });
        }
        if (Status) {
            updates.push('Status = @Status');
            inputs.push({ name: 'Status', value: Status });
        }
        if (Content) {
            updates.push('Content = @Content');
            inputs.push({ name: 'Content', value: Content });
        }

        if (updates.length === 0) {
            res.status(400).json({ message: "Không có trường nào để cập nhật" });
            return;
        }

        // Tạo truy vấn SQL cập nhật động
        const updateQuery = `
            UPDATE Article
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE BlogID = @BlogID AND IsDisabled = 0
        `;

        // Thêm tất cả input động vào request
        const request = pool.request().input('BlogID', articleId);
        inputs.forEach(input => request.input(input.name, input.value));

        // Thực thi truy vấn cập nhật
        const result = await request.query(updateQuery);
        // Trả về bài viết đã cập nhật
        res.status(200).json(result.recordset[0]);
    } catch (error: unknown) {
        // Xử lý lỗi truy vấn
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Có lỗi khi cập nhật bài viết" });
    }
}

/**
 * Xóa mềm một bài viết theo ID bằng cách đặt IsDisabled = true
 *
 * @route DELETE /api/articles/:id
 * @param id Mã BlogID của bài viết
 * @access Bảo vệ (yêu cầu xác thực)
 * @returns {Promise<void>} Phản hồi JSON xác nhận xóa
 * @throws {400} Nếu ID bài viết không hợp lệ
 * @throws {404} Nếu không tìm thấy bài viết hoặc đã bị vô hiệu hóa
 * @throws {500} Nếu thao tác cơ sở dữ liệu thất bại
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);

    // Kiểm tra ID hợp lệ
    if (isNaN(articleId)) {
        res.status(400).json({ message: "ID bài viết không hợp lệ" });
        return;
    }
    try {
        // Log quá trình xóa bài viết
        console.log(`Xóa bài viết với ID: ${articleId}`); // Log delete attempt
        const pool = await poolPromise;

        // Kiểm tra bài viết tồn tại và chưa bị vô hiệu hóa
        const checkResult = await pool.request()
            .input('BlogID', articleId)
            .query(`
                SELECT BlogID
                FROM Article
                WHERE BlogID = @BlogID AND IsDisabled = 0
            `);

        if (checkResult.recordset.length === 0) {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
            return;
        }

        // Xóa mềm bằng cách đặt IsDisabled = true
        await pool.request()
            .input('BlogID', articleId)
            .query(`
                UPDATE Article
                SET IsDisabled = 1
                WHERE BlogID = @BlogID
            `);
        // Trả về xác nhận xóa thành công
        res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error: unknown) {
        // Xử lý lỗi truy vấn
        const message = error instanceof Error ? error.message : String(error);
        console.error("Lỗi khi xóa bài viết:", message); // Log error
        res.status(500).json({ message: "Có lỗi khi xóa bài viết" });
    }
}