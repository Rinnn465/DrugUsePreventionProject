
import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";
import { Account } from "../types/type";
import bcrypt from "bcryptjs";

// Hàm kiểm tra định dạng email bằng biểu thức chính quy
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Hàm kiểm tra Username chỉ chứa chữ cái và số
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username);
};

// Get all accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID");
    res.json(result.recordset as Account[]);
  } catch (err: any) {
    console.error("Lỗi khi lấy danh sách tài khoản:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Get account by ID
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID WHERE AccountID = @AccountID");

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    res.json(result.recordset[0]);
  } catch (err: any) {
    console.error(`Lỗi khi lấy tài khoản ID ${req.params.id}:`, err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Create new account
export const createAccount = async (req: Request, res: Response) => {
  const { username, email, password, fullName, dateOfBirth, roleName } = req.body;
  try {
    const pool = await poolPromise;

    // Get RoleID from RoleName
    const roleResult = await pool
      .request()
      .input("roleName", sql.NVarChar, roleName || "Member")
      .query("SELECT RoleID FROM Role WHERE RoleName = @roleName");
    const role = roleResult.recordset[0];
    if (!role) {
      res.status(400).json({ message: "Vai trò không hợp lệ" });
      return;
    }

    await pool
      .request()
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("RoleID", sql.Int, role.RoleID)
      .input("CreatedAt", sql.DateTime2, new Date()).query(`INSERT INTO Account 
        (Username, Email, Password, FullName, DateOfBirth, RoleID, CreatedAt) 
        VALUES (@Username, @Email, @Password, @FullName, @DateOfBirth, @RoleID, @CreatedAt)`);
    res.status(201).json({ message: "Tài khoản đã được tạo" });
  } catch (err: any) {
    console.error("Lỗi khi tạo tài khoản:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Update account
export const updateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password, fullName, dateOfBirth, roleName, isDisabled } =
    req.body;
  try {
    const pool = await poolPromise;

    // Get RoleID from RoleName
    const roleResult = await pool
      .request()
      .input("roleName", sql.NVarChar, roleName)
      .query("SELECT RoleID FROM Role WHERE RoleName = @roleName");
    const role = roleResult.recordset[0];
    if (!role) {
      res.status(400).json({ message: "Vai trò không hợp lệ" });
      return;
    }

    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("RoleID", sql.Int, role.RoleID)
      .input("IsDisabled", sql.Bit, isDisabled).query(`UPDATE Account SET 
        Username=@Username, 
        Email=@Email, 
        Password=@Password, 
        FullName=@FullName, 
        DateOfBirth=@DateOfBirth, 
        RoleID=@RoleID, 
        IsDisabled=@IsDisabled
        WHERE AccountID=@AccountID`);
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    res.json({ message: "Tài khoản đã được cập nhật" });
  } catch (err: any) {
    console.error(`Lỗi khi cập nhật tài khoản ID ${req.params.id}:`, err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Update account profile
export const updateAccountProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, fullName, dateOfBirth } = req.body; // Partial data allowed
  const accountId = parseInt(req.params.id, 10);
  const user = (req as any).user; // From JWT middleware

  try {
    // Check if user is updating their own profile
    if (user.user.AccountID !== accountId) {
      res.status(403).json({ message: "Không có quyền cập nhật hồ sơ này" });
      return;
    }

    // Check if account is disabled
    const accountCheck = await poolPromise
      .then(pool => pool
        .request()
        .input("AccountID", sql.Int, accountId)
        .query("SELECT IsDisabled FROM Account WHERE AccountID = @AccountID")
      );
    if (accountCheck.recordset[0]?.IsDisabled) {
      res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
      return;
    }

    // Build dynamic SQL update query
    const pool = await poolPromise;
    const request = pool.request();
    request.input("AccountID", sql.Int, accountId);

    const updates: string[] = [];
    if (username !== undefined) {
      if (!username || username.length < 3 || username.length > 50) {
        res.status(400).json({ message: "Tên người dùng phải từ 3 đến 50 ký tự" });
        return;
      }
      if (!isValidUsername(username)) {
        res.status(400).json({ message: "Tên người dùng chỉ được chứa chữ cái và số" });
        return;
      }
      request.input("Username", sql.NVarChar, username);
      updates.push("Username = @Username");
    }
    if (email !== undefined) {
      res.status(400).json({ message: "Email không thể được thay đổi vì nó là duy nhất trong hệ thống" });
      return;
    }
    if (fullName !== undefined) {
      if (!fullName || fullName.length < 2 || fullName.length > 100) {
        res.status(400).json({ message: "Họ tên phải từ 2 đến 100 ký tự" });
        return;
      }
      request.input("FullName", sql.NVarChar, fullName);
      updates.push("FullName = @FullName");
    }
    if (dateOfBirth !== undefined) {
      if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
        res.status(400).json({ message: "Ngày sinh không được là ngày trong tương lai" });
        return;
      }
      request.input("DateOfBirth", sql.Date, dateOfBirth || null);
      updates.push("DateOfBirth = @DateOfBirth");
    }

    // Check if any field is provided for update
    if (updates.length === 0) {
      res.status(400).json({ message: "Không có trường nào được cập nhật" });
      return;
    }

    // Execute dynamic update query
    const query = `UPDATE Account SET ${updates.join(", ")} WHERE AccountID = @AccountID`;
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    // Fetch updated user data
    const updatedUser = await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID WHERE AccountID = @AccountID");

    res.json({
      message: "Hồ sơ đã được cập nhật",
      user: updatedUser.recordset[0]
    });
  } catch (err: any) {
    console.error(`Lỗi khi cập nhật hồ sơ cho AccountID ${accountId}:`, err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Update account password
export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const accountId = parseInt(req.params.id, 10);
  const user = (req as any).user; // From JWT middleware

  try {
    // Check if user is updating their own password
    if (user.user.AccountID !== accountId) {
      res.status(403).json({ message: "Không có quyền cập nhật mật khẩu này" });
      return;
    }

    // Check if account is disabled
    const accountCheck = await poolPromise
      .then(pool => pool
        .request()
        .input("AccountID", sql.Int, accountId)
        .query("SELECT IsDisabled FROM Account WHERE AccountID = @AccountID")
      );
    if (accountCheck.recordset[0]?.IsDisabled) {
      res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
      return;
    }

    // Input validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "Vui lòng cung cấp đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu" });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
      return;
    }

    // Fetch current user
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .query("SELECT Password FROM Account WHERE AccountID = @AccountID");

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    const userData = result.recordset[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userData.Password);
    if (!isMatch) {
      res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .input("Password", sql.NVarChar, hashedPassword)
      .query("UPDATE Account SET Password = @Password WHERE AccountID = @AccountID");

    res.json({ message: "Mật khẩu đã được cập nhật" });
  } catch (err: any) {
    console.error(`Lỗi khi cập nhật mật khẩu cho AccountID ${accountId}:`, err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Delete account
export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .query("DELETE FROM Account WHERE AccountID=@AccountID");
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    res.json({ message: "Tài khoản đã được xóa" });
  } catch (err: any) {
    console.error(`Lỗi khi xóa tài khoản ID ${req.params.id}:`, err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thống kê tổng số tài khoản theo từng tháng
export const getMonthlyAccountCountStatistic = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    // Truy vấn lấy số lượng tài khoản được tạo theo từng tháng
    const result = await pool.request().query(`
      SELECT 
        YEAR(CreatedAt) AS Year,
        MONTH(CreatedAt) AS Month,
        COUNT(*) as total
      FROM Account
      WHERE CreatedAt IS NOT NULL
      GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
      ORDER BY Year, Month
    `);
    res.json({ data: result.recordset });
  } catch (err: any) {
    console.error("Lỗi khi thống kê tổng số tài khoản theo tháng:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * So sánh số lượng tài khoản được tạo giữa tháng hiện tại và tháng trước
 * @route GET /api/account/statistics/compare-count
 * @access Chỉ Admin
 * @returns {Promise<void>} Phản hồi JSON với số lượng tài khoản tháng trước, tháng hiện tại và phần trăm thay đổi
 */
export const compareAccountCountStatistic = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    // Lấy tháng và năm hiện tại
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    // Tính tháng và năm trước
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    // Truy vấn số lượng tài khoản tháng trước
    const prevResult = await pool.request()
      .input('prevMonth', sql.Int, prevMonth)
      .input('prevYear', sql.Int, prevYear)
      .query(`
        SELECT COUNT(*) AS PrevCount
        FROM Account
        WHERE MONTH(CreatedAt) = @prevMonth AND YEAR(CreatedAt) = @prevYear
      `);
    // Truy vấn số lượng tài khoản tháng hiện tại
    const currResult = await pool.request()
      .input('currMonth', sql.Int, currentMonth)
      .input('currYear', sql.Int, currentYear)
      .query(`
        SELECT COUNT(*) AS CurrCount
        FROM Account
        WHERE MONTH(CreatedAt) = @currMonth AND YEAR(CreatedAt) = @currYear
      `);
    const prevCount = prevResult.recordset[0]?.PrevCount || 0;
    const currCount = currResult.recordset[0]?.CurrCount || 0;
    // Tính phần trăm thay đổi
    let percentChange = 0;
    if (prevCount === 0 && currCount > 0) {
      percentChange = 100;
    } else if (prevCount === 0 && currCount === 0) {
      percentChange = 0;
    } else {
      percentChange = ((currCount - prevCount) / prevCount) * 100;
    }
    res.status(200).json({
      message: 'So sánh số lượng tài khoản được tạo giữa tháng hiện tại và tháng trước thành công',
      previousMonth: { year: prevYear, month: prevMonth, count: prevCount },
      currentMonth: { year: currentYear, month: currentMonth, count: currCount },
      percentChange
    });
  } catch (err: any) {
    console.error('Lỗi trong compareAccountCountStatistic:', err);
    res.status(500).json({
      message: 'Lỗi khi so sánh số lượng tài khoản được tạo',
      error: err.message
    });
  }
};

// Thống kê tổng số người dùng (tài khoản)
export const getTotalAccountCountStatistic = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT COUNT(*) AS TotalAccount FROM Account
    `);
    res.status(200).json({
      message: 'Thống kê tổng số người dùng thành công',
      totalAccount: result.recordset[0]?.TotalAccount || 0
    });
  } catch (err: any) {
    console.error('Lỗi khi thống kê tổng số người dùng:', err.message);
    res.status(500).json({
      message: 'Lỗi khi thống kê tổng số người dùng',
      error: err.message
    });
  }
};
