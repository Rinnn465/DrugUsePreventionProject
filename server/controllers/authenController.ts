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
 * Authenticates a user and generates a JWT token
 * 
 * @route POST /api/auth/login
 * @access Public
 * @param {Request} req - Express request object with email and password in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response with token and user data
 * @throws {400} If user is not found
 * @throws {401} If password is invalid
 * @throws {500} If server error occurs
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body;

  try {
    // Get database connection and find user by email
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID WHERE Email = @email");
    const user = result.recordset[0];

    // Validate user exists
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user: {
          AccountID: user.AccountID,
          Username: user.Username,
          Email: user.Email,
          FullName: user.FullName,
          RoleID: user.RoleID, // Use RoleID instead of Role
          RoleName: user.RoleName, // Include RoleName for convenience
          CreatedAt: user.CreatedAt,
          IsDisabled: user.IsDisabled
        }
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
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
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Handles user logout
 * Since JWT is stateless, this primarily serves as a client-side cleanup endpoint
 * 
 * @route POST /api/auth/logout
 * @access Public
 * @returns {Promise<void>} Success message
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Since JWT is stateless, logout is handled client-side by clearing the token
    res.status(200).json({ message: "Logout successful" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Registers a new user in the system
 * 
 * @route POST /api/auth/register
 * @access Public
 * @param {Request} req - Express request object with registration details in body
 * @returns {Promise<void>} Success message
 * @throws {400} If username or email already exists
 * @throws {500} If server error occurs
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password, email, fullName, dateOfBirth, roleName } = req.body;

  try {
    const pool = await poolPromise;



    // Check for existing username
    const checkUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Account WHERE Username = @username");
    if (checkUser.recordset.length > 0) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    // Check for existing email
    const checkEmail = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Account WHERE Email = @email");
    if (checkEmail.recordset.length > 0) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Get RoleID for default role "Member"
    const roleResult = await pool
      .request()
      .input("roleName", sql.NVarChar, "Member")
      .query("SELECT RoleID FROM Role WHERE RoleName = @roleName");
    const role = roleResult.recordset[0];
    if (!role) {
      res.status(500).json({ message: "role 'Member' not found in Role table" });
      return;
    }
    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
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

    // Send welcome email
    try {
      await sendEmail(
        email,
        "🎉 Welcome to Our App!",
        welcomeTemplate(fullName, username)
      );
    } catch (emailErr) {
      console.warn("Email sending failed:", emailErr); // Non-critical error
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Initiates the password reset process
 * Generates a reset token and sends it via email
 * 
 * @route POST /api/auth/forgot-password
 * @access Public
 * @param {Request} req - Express request object with email in body
 * @returns {Promise<void>} Success message
 * @throws {404} If email is not found
 * @throws {500} If server error occurs
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email } = req.body;

  try {
    const pool = await poolPromise;
    // Check if user exists
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Account WHERE Email = @email');
    const user = result.recordset[0];

    if (!user) {
      res.status(404).json({ message: "Email not found" });
      return;
    }

    // Generate secure random reset token
    const resetToken = (Math.random().toString(36).substr(2) + Date.now().toString(36));
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Store reset token in database
    await pool.request()
      .input('userId', sql.Int, user.AccountID)
      .input('resetToken', sql.VarChar, resetToken)
      .input('resetTokenExpiry', sql.DateTime2, resetTokenExpiry)
      .query('UPDATE Account SET ResetToken = @resetToken, ResetTokenExpiry = @resetTokenExpiry WHERE AccountID = @userId');

    // Generate reset link and send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      '🔑 Password Reset Request',
      passwordReset(user.FullName, resetLink)
    );

    res.json({ message: "Password reset email sent" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Verifies a password reset token's validity
 * 
 * @route POST /api/auth/verify-reset-token
 * @access Public
 * @param {Request} req - Express request object with token in body
 * @returns {Promise<void>} Token validity status
 */
export async function postVerifyResetToken(req: Request, res: Response): Promise<void> {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ valid: false, message: "Token is required" });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('resetToken', sql.VarChar, token)
      .query('SELECT ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken');
    const user = result.recordset[0];

    if (!user) {
      res.json({ valid: false, message: "Invalid or expired token" });
      return;
    }

    if (!user.ResetTokenExpiry || new Date(user.ResetTokenExpiry) < new Date()) {
      res.json({ valid: false, message: "Token has expired" });
      return;
    }

    res.json({ valid: true });
  } catch (err) {
    res.json({ valid: false, message: "Server error" });
  }
}

/**
 * Completes the password reset process
 * 
 * @route POST /api/auth/reset-password
 * @access Public
 * @param {Request} req - Express request object with token and new password
 * @returns {Promise<void>} Success message
 * @throws {400} If passwords don't match or token is invalid
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token || !newPassword || !confirmPassword) {
    res.status(400).json({ message: "Token, new password, and confirm password are required" });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match" });
    return;
  }

  try {
    const pool = await poolPromise;

    // Find user by reset token and check expiry
    const result = await pool.request()
      .input('resetToken', sql.VarChar, token)
      .query('SELECT AccountID, ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken');
    const user = result.recordset[0];

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Check if token is expired
    if (!user.ResetTokenExpiry || new Date(user.ResetTokenExpiry) < new Date()) {
      res.status(400).json({ message: "Token has expired" });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and invalidate reset token
    await pool.request()
      .input('userId', sql.Int, user.AccountID)
      .input('password', sql.VarChar, hashedPassword)
      .query('UPDATE Account SET Password = @password, ResetToken = NULL, ResetTokenExpiry = NULL WHERE AccountID = @userId');

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
}