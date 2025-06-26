import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { AccountID: number };
    }
  }
}

/**
 * Interface định nghĩa cấu trúc của một tài khoản trong cơ sở dữ liệu
 * Chứa tất cả các trường ánh xạ với các cột của bảng Account
 */
interface Account {
  AccountID: number;      // Khóa chính của tài khoản
  Username: string;       // Tên đăng nhập duy nhất
  Email: string;         // Địa chỉ email của người dùng
  Password: string;      // Mật khẩu đã được mã hóa
  FullName: string;      // Họ tên đầy đủ
  DateOfBirth: Date | null;  // Ngày sinh (có thể không bắt buộc)
  Role: string;         // Vai trò người dùng (ví dụ: admin, user, staff)
  CreatedAt: Date;      // Thời điểm tạo tài khoản
  IsDisabled: boolean;  // Trạng thái tài khoản
  ResetToken?: string | null;  // Token đặt lại mật khẩu
}

/**
 * Lấy tất cả tài khoản từ cơ sở dữ liệu
 * Chỉ quản trị viên mới có quyền truy cập
 *
 * @route GET /api/accounts
 * @access Private (Chỉ Admin)
 * @returns {Promise<void>} Trả về danh sách tài khoản
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export const getAccounts = async (req: Request, res: Response) => {
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Thực thi truy vấn SELECT để lấy tất cả tài khoản
    const result = await pool.request().query("SELECT * FROM Account");
    // Gửi phản hồi với danh sách tài khoản
    res.json(result.recordset as Account[]);
  } catch (err: any) {
    // Xử lý lỗi cơ sở dữ liệu hoặc server
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy thông tin tài khoản theo ID
 *
 * @route GET /api/accounts/:id
 * @param id ID tài khoản cần lấy
 * @access Private
 * @returns {Promise<void>} Trả về thông tin tài khoản nếu tìm thấy
 * @throws {404} Nếu không tìm thấy tài khoản
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Truy vấn tài khoản theo ID với tham số SQL để tránh injection
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .query("SELECT * FROM Account WHERE AccountID = @AccountID");
    // Kiểm tra tài khoản tồn tại
    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    // Trả về tài khoản tìm được
    res.json(result.recordset[0]);
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo mới tài khoản trong hệ thống
 *
 * @route POST /api/accounts
 * @access Public
 * @body {username, email, password, fullName, dateOfBirth?, role?}
 * @returns {Promise<void>} Trả về phản hồi thành công nếu tạo tài khoản thành công
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 * Lưu ý: Nên mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
 */
export const createAccount = async (req: Request, res: Response) => {
  // Lấy các trường cần thiết từ request body
  const { username, email, password, fullName, dateOfBirth, role } = req.body;
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Thêm tài khoản mới với truy vấn có tham số để đảm bảo an toàn
    await pool
      .request()
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)  // Lưu ý: Nên mã hóa mật khẩu trước khi lưu
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("Role", sql.NVarChar, role)
      .input("CreatedAt", sql.DateTime2, new Date())
      .query(`INSERT INTO Account 
        (Username, Email, Password, FullName, DateOfBirth, Role, CreatedAt) 
        VALUES (@Username, @Email, @Password, @FullName, @DateOfBirth, @Role, @CreatedAt)`);
    // Trả về phản hồi thành công
    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật thông tin tài khoản
 * Lưu ý: Việc cập nhật vai trò được xử lý riêng để đảm bảo an toàn
 *
 * @route PUT /api/accounts/:id
 * @param id ID tài khoản cần cập nhật
 * @access Private
 * @body {username?, email?, password?, fullName?, dateOfBirth?, isDisabled?}
 * @returns {Promise<void>} Trả về phản hồi thành công nếu cập nhật thành công
 * @throws {404} Nếu không tìm thấy tài khoản
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 * Lưu ý: Nên mã hóa mật khẩu trước khi cập nhật
 */
export const updateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Lấy các trường cần cập nhật từ request body
  const { username, email, password, fullName, dateOfBirth, isDisabled } = req.body;
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Cập nhật tài khoản với truy vấn có tham số
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)  // Lưu ý: Nên mã hóa mật khẩu trước khi cập nhật
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("IsDisabled", sql.Bit, isDisabled)
      .query(`UPDATE Account SET 
        Username=@Username, 
        Email=@Email, 
        Password=@Password, 
        FullName=@FullName, 
        DateOfBirth=@DateOfBirth, 
        IsDisabled=@IsDisabled
        WHERE AccountID=@AccountID`);
    // Kiểm tra tài khoản đã được cập nhật chưa
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    // Trả về phản hồi thành công
    res.json({ message: "Cập nhật tài khoản thành công" });
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa tài khoản khỏi hệ thống
 * Thao tác này là vĩnh viễn và không thể hoàn tác
 *
 * @route DELETE /api/accounts/:id
 * @param id ID tài khoản cần xóa
 * @access Private (Chỉ Admin)
 * @returns {Promise<void>} Trả về phản hồi thành công nếu xóa thành công
 * @throws {404} Nếu không tìm thấy tài khoản
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Xóa tài khoản với truy vấn có tham số
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .query("DELETE FROM Account WHERE AccountID=@AccountID");
    // Kiểm tra tài khoản đã được xóa chưa
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    // Trả về phản hồi thành công
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
};

/**
 * Thay đổi vai trò của tài khoản
 * Đây là hàm riêng biệt với updateAccount để đảm bảo an toàn
 * Chỉ quản trị viên mới có quyền thay đổi vai trò
 *
 * @route PATCH /api/accounts/:id/role
 * @param id ID tài khoản cần cập nhật
 * @access Private (Chỉ Admin)
 * @body {role} Vai trò mới cần gán
 * @returns {Promise<void>} Trả về phản hồi thành công nếu cập nhật vai trò thành công
 * @throws {404} Nếu không tìm thấy tài khoản
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export const changeAccountRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { role } = req.body;
  // Kiểm tra vai trò hợp lệ
  if (!role) {
    res.status(400).json({ message: "Vai trò là bắt buộc" });
    return;
  }
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Cập nhật vai trò với truy vấn có tham số
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .input("Role", sql.NVarChar, role)
      .query("UPDATE Account SET Role=@Role WHERE AccountID=@AccountID");
    // Kiểm tra tài khoản đã được cập nhật chưa
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    // Trả về phản hồi thành công
    res.json({ message: "Cập nhật vai trò thành công" });
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
};

//updateAccountProfile
/**
 * Cập nhật thông tin hồ sơ tài khoản
 * Chỉ cho phép cập nhật các trường không nhạy cảm như tên, email, ngày sinh
 *
 * @route PUT /api/accounts/profile
 * @access Private
 * @body {fullName?, email?, dateOfBirth?}
 * @returns {Promise<void>} Trả về phản hồi thành công nếu cập nhật thành công
 * @throws {500} Nếu có lỗi server hoặc cơ sở dữ liệu
 */
export const updateAccountProfile = async (
  req: Request,
  res: Response 
): Promise<void> => {
  const { fullName, email, dateOfBirth } = req.body;
  try {
    // Lấy kết nối cơ sở dữ liệu từ pool
    const pool = await poolPromise;
    // Cập nhật thông tin hồ sơ với truy vấn có tham số
    const result = await pool
      .request()
      .input("AccountID", sql.Int, req.user?.AccountID) // Lấy ID từ token người dùng
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .query(`UPDATE Account SET 
        FullName=@FullName, 
        Email=@Email, 
        DateOfBirth=@DateOfBirth 
        WHERE AccountID=@AccountID`);
    // Kiểm tra tài khoản đã được cập nhật chưa
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    // Trả về phản hồi thành công
    res.json({ message: "Cập nhật hồ sơ thành công" });
  } catch (err: any) {
    // Xử lý lỗi truy vấn
    res.status(500).json({ error: err.message });
  }
}


