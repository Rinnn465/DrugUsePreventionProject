
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
    const result = await pool.request().query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID ORDER BY Account.CreatedAt DESC");
    
    // Convert relative ProfilePicture paths to full URLs
    const accounts = result.recordset.map((account: any) => {
      if (account.ProfilePicture) {
        account.ProfilePicture = `http://localhost:5000${account.ProfilePicture}`;
      }
      return account;
    });
    
    res.json(accounts as Account[]);
  } catch (err: any) {
    console.error("Lỗi khi lấy danh sách tài khoản:", err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Get all roles  
export const getRoles = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT RoleID, RoleName FROM Role ORDER BY RoleID");
    res.json(result.recordset);
  } catch (err: any) {
    console.error("Lỗi khi lấy danh sách vai trò:", err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
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

    const account = result.recordset[0];
    
    // Convert relative ProfilePicture path to full URL if exists
    if (account.ProfilePicture) {
      account.ProfilePicture = `http://localhost:5000${account.ProfilePicture}`;
    }

    res.json(account);
  } catch (err: any) {
    console.error(`Lỗi khi lấy ID tài khoản ${req.params.id}:`, err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Create new account
export const createAccount = async (req: Request, res: Response) => {
  const { Username, Email, Password, FullName, DateOfBirth, RoleID } = req.body;
  
  try {
    const pool = await poolPromise;

    // Validation input
    if (!Username || !Email || !Password || !FullName) {
      res.status(400).json({ message: "Tất cả các trường bắt buộc phải được điền" });
      return;
    }

    if (!isValidEmail(Email)) {
      res.status(400).json({ message: "Email không hợp lệ" });
      return;
    }

    if (!isValidUsername(Username)) {
      res.status(400).json({ message: "Tên người dùng chỉ được chứa chữ cái và số" });
      return;
    }

    if (Password.length < 8) {
      res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }

    // Validate RoleID exists
    const roleResult = await pool
      .request()
      .input("RoleID", sql.Int, RoleID || 3) // Default to Member role (RoleID = 3)
      .query("SELECT RoleID, RoleName FROM Role WHERE RoleID = @RoleID");
    
    if (roleResult.recordset.length === 0) {
      res.status(400).json({ message: "Vai trò không hợp lệ" });
      return;
    }

    // Check if Username already exists
    const usernameCheck = await pool
      .request()
      .input("Username", sql.NVarChar, Username)
      .query("SELECT AccountID FROM Account WHERE Username = @Username");
    
    if (usernameCheck.recordset.length > 0) {
      res.status(400).json({ message: "Tên người dùng đã tồn tại" });
      return;
    }

    // Check if Email already exists
    const emailCheck = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT AccountID FROM Account WHERE Email = @Email");
    
    if (emailCheck.recordset.length > 0) {
      res.status(400).json({ message: "Email đã tồn tại" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Insert new account
    await pool
      .request()
      .input("Username", sql.NVarChar, Username)
      .input("Email", sql.NVarChar, Email)
      .input("Password", sql.NVarChar, hashedPassword)
      .input("FullName", sql.NVarChar, FullName)
      .input("DateOfBirth", sql.Date, DateOfBirth || null)
      .input("RoleID", sql.Int, RoleID || 3)
      .input("CreatedAt", sql.DateTime2, new Date())
      .query(`INSERT INTO Account 
        (Username, Email, Password, FullName, DateOfBirth, RoleID, CreatedAt, IsDisabled) 
        VALUES (@Username, @Email, @Password, @FullName, @DateOfBirth, @RoleID, @CreatedAt, 0)`);
    
    res.status(201).json({ message: "Tài khoản đã được tạo thành công" });
  } catch (err: any) {
    console.error("Lỗi khi tạo tài khoản:", err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Update account
export const updateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { Username, Email, FullName, DateOfBirth, RoleID, IsDisabled } = req.body;
  const accountId = parseInt(req.params.id, 10);
  const currentUser = (req as any).user?.user; // From JWT middleware

  try {
    const pool = await poolPromise;

    // Get current account info
    const currentAccountResult = await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .query("SELECT AccountID, RoleID FROM Account WHERE AccountID = @AccountID");
    
    if (currentAccountResult.recordset.length === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    const targetAccount = currentAccountResult.recordset[0];

    // Validation: Admin không thể thay đổi role của chính mình
    if (currentUser?.AccountID === accountId && RoleID !== undefined) {
      res.status(403).json({ message: "Không thể thay đổi vai trò của chính mình" });
      return;
    }

    // Validation: Không cho phép thay đổi role của Admin khác (chỉ có Super Admin mới được)
    if (targetAccount.RoleID === 1 && RoleID !== undefined && RoleID !== 1) {
      res.status(403).json({ message: "Không thể thay đổi vai trò của Admin" });
      return;
    }

    // Validation: Không cho phép tạo thêm Admin
    if (RoleID === 1 && targetAccount.RoleID !== 1) {
      res.status(403).json({ message: "Không thể nâng cấp tài khoản lên Admin" });
      return;
    }

    // Validate RoleID if provided
    if (RoleID !== undefined) {
      const roleResult = await pool
        .request()
        .input("RoleID", sql.Int, RoleID)
        .query("SELECT RoleID, RoleName FROM Role WHERE RoleID = @RoleID");
      
      if (roleResult.recordset.length === 0) {
        res.status(400).json({ message: "Vai trò không hợp lệ" });
        return;
      }
    }

    // Check if Username already exists (excluding current account)
    if (Username) {
      if (!isValidUsername(Username)) {
        res.status(400).json({ message: "Tên người dùng chỉ được chứa chữ cái và số" });
        return;
      }

      const usernameCheck = await pool
        .request()
        .input("Username", sql.NVarChar, Username)
        .input("AccountID", sql.Int, accountId)
        .query("SELECT AccountID FROM Account WHERE Username = @Username AND AccountID != @AccountID");
      
      if (usernameCheck.recordset.length > 0) {
        res.status(400).json({ message: "Tên người dùng đã tồn tại" });
        return;
      }
    }

    // Check if Email already exists (excluding current account)
    if (Email) {
      if (!isValidEmail(Email)) {
        res.status(400).json({ message: "Email không hợp lệ" });
        return;
      }

      const emailCheck = await pool
        .request()
        .input("Email", sql.NVarChar, Email)
        .input("AccountID", sql.Int, accountId)
        .query("SELECT AccountID FROM Account WHERE Email = @Email AND AccountID != @AccountID");
      
      if (emailCheck.recordset.length > 0) {
        res.status(400).json({ message: "Email đã tồn tại" });
        return;
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();
    request.input("AccountID", sql.Int, accountId);

    if (Username !== undefined) {
      request.input("Username", sql.NVarChar, Username);
      updates.push("Username = @Username");
    }
    if (Email !== undefined) {
      request.input("Email", sql.NVarChar, Email);
      updates.push("Email = @Email");
    }
    if (FullName !== undefined) {
      request.input("FullName", sql.NVarChar, FullName);
      updates.push("FullName = @FullName");
    }
    if (DateOfBirth !== undefined) {
      request.input("DateOfBirth", sql.Date, DateOfBirth);
      updates.push("DateOfBirth = @DateOfBirth");
    }
    if (RoleID !== undefined) {
      request.input("RoleID", sql.Int, RoleID);
      updates.push("RoleID = @RoleID");
    }
    if (IsDisabled !== undefined) {
      request.input("IsDisabled", sql.Bit, IsDisabled);
      updates.push("IsDisabled = @IsDisabled");
    }

    if (updates.length === 0) {
      res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
      return;
    }

    const result = await request.query(`UPDATE Account SET ${updates.join(', ')} WHERE AccountID = @AccountID`);
    
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    res.json({ message: "Tài khoản đã được cập nhật thành công" });
  } catch (err: any) {
    console.error(`Lỗi khi cập nhật tài khoản ID ${req.params.id}:`, err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
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

    const userData = updatedUser.recordset[0];
    
    // Convert relative ProfilePicture path to full URL if exists
    if (userData.ProfilePicture) {
      userData.ProfilePicture = `http://localhost:5000${userData.ProfilePicture}`;
    }

    res.json({
      message: "Hồ sơ đã được cập nhật",
      user: userData
    });
  } catch (err: any) {
    console.error(`Lỗi khi cập nhật hồ sơ cho AccountID ${accountId}:`, err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
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
    res.status(500).json({ error: "Lỗi máy chủ" });
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
    res.status(500).json({ error: "Lỗi máy chủ" });
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
    res.status(500).json({ error: "Lỗi máy chủ" });
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

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.id, 10);
  const user = (req as any).user; // From JWT middleware

  try {
    // Check if user is updating their own avatar
    if (user.user.AccountID !== accountId) {
      res.status(403).json({ message: "Không có quyền cập nhật avatar này" });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: "Vui lòng chọn file ảnh" });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ message: "Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)" });
      return;
    }

    // Generate file path (relative to public folder)
    const fileName = `avatar_${accountId}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const filePath = `/uploads/avatars/${fileName}`;
    const fullPath = `./public${filePath}`;

    // Create directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.dirname(fullPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move file to uploads directory
    fs.writeFileSync(fullPath, req.file.buffer);

    // Update database
    const pool = await poolPromise;
    await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .input("ProfilePicture", sql.NVarChar, filePath)
      .query("UPDATE Account SET ProfilePicture = @ProfilePicture WHERE AccountID = @AccountID");

    res.json({ 
      message: "Upload avatar thành công",
      profilePicture: `http://localhost:5000${filePath}`
    });
  } catch (err: any) {
    console.error(`Lỗi khi upload avatar cho AccountID ${accountId}:`, err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Remove avatar
export const removeAvatar = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.id, 10);
  const user = (req as any).user; // From JWT middleware

  try {
    // Check if user is removing their own avatar
    if (user.user.AccountID !== accountId) {
      res.status(403).json({ message: "Không có quyền xóa avatar này" });
      return;
    }

    // Get current avatar path from database
    const pool = await poolPromise;
    const currentResult = await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .query("SELECT ProfilePicture FROM Account WHERE AccountID = @AccountID");

    if (currentResult.recordset.length === 0) {
      res.status(404).json({ message: "Tài khoản không tồn tại" });
      return;
    }

    const currentProfilePicture = currentResult.recordset[0].ProfilePicture;

    // Remove file from filesystem if exists
    if (currentProfilePicture) {
      const fs = require('fs');
      const fullPath = `./public${currentProfilePicture}`;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Update database to remove profile picture
    await pool
      .request()
      .input("AccountID", sql.Int, accountId)
      .query("UPDATE Account SET ProfilePicture = NULL WHERE AccountID = @AccountID");

    res.json({ 
      message: "Xóa avatar thành công"
    });
  } catch (err: any) {
    console.error(`Lỗi khi xóa avatar cho AccountID ${accountId}:`, err.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};