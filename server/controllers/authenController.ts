import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql, poolPromise } from "../config/database";
import { sendEmail } from "./mailController";
import { welcomeTemplate } from "../templates/welcome";
import { passwordReset } from "../templates/passwordreset";
dotenv.config();

/**
 * Xác thực người dùng và tạo mã thông báo JWT
 * 
 * @route POST /api/auth/login
 * @access Public
 * @param {Request} req - Đối tượng request của Express chứa email và mật khẩu trong body
 * @param {Response} res - Đối tượng response của Express
 * @param {NextFunction} next - Hàm middleware tiếp theo của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mã thông báo và dữ liệu người dùng
 * @throws {400} Nếu không tìm thấy người dùng
 * @throws {401} Nếu mật khẩu không hợp lệ
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body;

  try {
    // Lấy kết nối cơ sở dữ liệu và tìm người dùng theo email
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID WHERE Email = @email");
    const user = result.recordset[0];

    // Kiểm tra người dùng tồn tại
    if (!user) {
      res.status(400).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Xác thực mật khẩu
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      res.status(401).json({ message: "Mật khẩu không hợp lệ" });
      return;
    }
    
    // Tạo mã thông báo JWT
    const token = jwt.sign(
      { 
        user: { 
          AccountID: user.AccountID,
          Username: user.Username,
          Email: user.Email,
          FullName: user.FullName,
          RoleID: user.RoleID, // Sử dụng RoleID thay vì Role
          RoleName: user.RoleName, // Bao gồm RoleName cho tiện lợi
          CreatedAt: user.CreatedAt,
          IsDisabled: user.IsDisabled
        }
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

      res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { 
        AccountID: user.AccountID,
        Username: user.Username,
        Email: user.Email,
        FullName: user.FullName,
        RoleID: user.RoleID,
        RoleName: user.RoleName,
        CreatedAt: user.CreatedAt,
        IsDisabled: user.IsDisabled
      }
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Xử lý đăng xuất người dùng
 * Vì JWT là trạng thái không, điểm này chủ yếu phục vụ cho việc dọn dẹp phía khách hàng
 * 
 * @route POST /api/auth/logout
 * @access Public
 * @returns {Promise<void>} Thông báo thành công
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Vì JWT là trạng thái không, đăng xuất được xử lý ở phía khách hàng bằng cách xóa mã thông báo
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Đăng ký người dùng mới vào hệ thống
 * 
 * @route POST /api/auth/register
 * @access Public
 * @param {Request} req - Đối tượng request của Express chứa thông tin đăng ký trong body
 * @returns {Promise<void>} Thông báo thành công
 * @throws {400} Nếu tên đăng nhập hoặc email đã tồn tại
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password, email, fullName, dateOfBirth, roleName } = req.body;

  try {
    const pool = await poolPromise;

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    const checkUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Account WHERE Username = @username");
    if (checkUser.recordset.length > 0) {
      res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
      return;
    }

    // Kiểm tra email đã tồn tại chưa
    const checkEmail = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Account WHERE Email = @email");
    if (checkEmail.recordset.length > 0) {
      res.status(400).json({ message: "Email đã tồn tại" });
      return;
    }

    // Lấy RoleID cho vai trò mặc định "Member"
    const roleResult = await pool
      .request()
      .input("roleName", sql.NVarChar, "Member")
      .query("SELECT RoleID FROM Role WHERE RoleName = @roleName");
    const role = roleResult.recordset[0];
    if (!role) {
      res.status(500).json({ message: "Không tìm thấy vai trò 'Member' trong bảng Role" });
      return;
    }

    // Mã hóa mật khẩu để bảo mật
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm người dùng mới vào cơ sở dữ liệu
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("fullName", sql.NVarChar, fullName)
      .input("dateOfBirth", sql.Date, dateOfBirth)
      .input("roleID", sql.Int, role.RoleID)
      .input("createdAt", sql.DateTime2, new Date())
      .query(
        `INSERT INTO Account 
                (Username, Email, Password, FullName, DateOfBirth, RoleID, CreatedAt) 
                VALUES 
                (@username, @email, @password, @fullName, @dateOfBirth, @roleID, @createdAt)`
      );

    // Gửi email chào mừng
    try {
      await sendEmail(
        email,
        "🎉 Chào mừng bạn đến với ứng dụng!",
        welcomeTemplate(fullName, username)
      );
    } catch (emailErr) {
      console.warn("Gửi email thất bại:", emailErr); // Lỗi không nghiêm trọng
    }

    res.status(201).json({ message: "Đăng ký người dùng thành công" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/**
 * Khởi tạo quá trình quên mật khẩu
 * Sinh token đặt lại mật khẩu và gửi qua email
 * 
 * @route POST /api/auth/forgot-password
 * @access Public
 * @param {Request} req - Đối tượng request của Express chứa email trong body
 * @returns {Promise<void>} Thông báo thành công
 * @throws {404} Nếu không tìm thấy email
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;

    try {
        const pool = await poolPromise;
        // Kiểm tra người dùng tồn tại
        const result = await pool
            .request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Account WHERE Email = @email');
        const user = result.recordset[0];

        if (!user) {
            res.status(404).json({ message: "Không tìm thấy email" });
            return;
        }

        // Sinh token đặt lại mật khẩu ngẫu nhiên và thời hạn
        const resetToken = (Math.random().toString(36).substr(2) + Date.now().toString(36));
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Hết hạn sau 1 giờ

        // Lưu token vào cơ sở dữ liệu
        await pool.request()
            .input('userId', sql.Int, user.AccountID)
            .input('resetToken', sql.VarChar, resetToken)
            .input('resetTokenExpiry', sql.DateTime2, resetTokenExpiry)
            .query('UPDATE Account SET ResetToken = @resetToken, ResetTokenExpiry = @resetTokenExpiry WHERE AccountID = @userId');

        // Tạo link đặt lại mật khẩu và gửi email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail(
            email,
            '🔑 Yêu cầu đặt lại mật khẩu',
            passwordReset(user.FullName, resetLink)
        );
        
        res.json({ message: "Đã gửi email đặt lại mật khẩu" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

/**
 * Kiểm tra tính hợp lệ của token đặt lại mật khẩu
 * 
 * @route POST /api/auth/verify-reset-token
 * @access Public
 * @param {Request} req - Đối tượng request của Express chứa token trong body
 * @returns {Promise<void>} Trạng thái hợp lệ của token
 */
export async function postVerifyResetToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ valid: false, message: "Token là bắt buộc" });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('resetToken', sql.VarChar, token)
            .query('SELECT ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken');
        const user = result.recordset[0];

        if (!user) {
            res.json({ valid: false, message: "Token không hợp lệ hoặc đã hết hạn" });
            return;
        }

        if (!user.ResetTokenExpiry || new Date(user.ResetTokenExpiry) < new Date()) {
            res.json({ valid: false, message: "Token đã hết hạn" });
            return;
        }

        res.json({ valid: true });
    } catch (err) {
        res.json({ valid: false, message: "Lỗi máy chủ" });
    }
}

/**
 * Hoàn tất quá trình đặt lại mật khẩu
 * 
 * @route POST /api/auth/reset-password
 * @access Public
 * @param {Request} req - Đối tượng request của Express chứa token và mật khẩu mới
 * @returns {Promise<void>} Thông báo thành công
 * @throws {400} Nếu mật khẩu không khớp hoặc token không hợp lệ
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
        res.status(400).json({ message: "Token, mật khẩu mới và xác nhận mật khẩu là bắt buộc" });
        return;
    }

    if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "Mật khẩu không khớp" });
        return;
    }

    try {
        const pool = await poolPromise;

        // Tìm người dùng theo token và kiểm tra hạn sử dụng
        const result = await pool.request()
            .input('resetToken', sql.VarChar, token)
            .query('SELECT AccountID, ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken');
        const user = result.recordset[0];

        if (!user) {
            res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
            return;
        }

        // Kiểm tra token đã hết hạn chưa
        if (!user.ResetTokenExpiry || new Date(user.ResetTokenExpiry) < new Date()) {
            res.status(400).json({ message: "Token đã hết hạn" });
            return;
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu và xóa token đặt lại
        await pool.request()
            .input('userId', sql.Int, user.AccountID)
            .input('password', sql.VarChar, hashedPassword)
            .query('UPDATE Account SET Password = @password, ResetToken = NULL, ResetTokenExpiry = NULL WHERE AccountID = @userId');

        res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}