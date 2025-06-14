import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql, poolPromise } from "../config/database";
import { sendEmail } from "./mailController";
import { welcomeTemplate } from "../templates/welcome";
import { passwordReset } from "../templates/passwordreset";
dotenv.config();

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Account WHERE Email = @email");
    const user = result.recordset[0];

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign({ user: user }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { ...user },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

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

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password, email, fullName, dateOfBirth, role } = req.body;

  try {
    const pool = await poolPromise;

    const checkUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Account WHERE Username = @username");
    if (checkUser.recordset.length > 0) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const checkEmail = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Account WHERE Email = @email");
    if (checkEmail.recordset.length > 0) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("fullName", sql.NVarChar, fullName)
      .input("dateOfBirth", sql.Date, dateOfBirth || null)
      .input("role", sql.NVarChar, role || "member")
      .input("createdAt", sql.DateTime2, new Date())
      .query(
        `INSERT INTO Account 
                (Username, Email, Password, FullName, DateOfBirth, Role, CreatedAt) 
                VALUES 
                (@username, @email, @password, @fullName, @dateOfBirth, @role, @createdAt)`
      );
    try {
      await sendEmail(
        email,
        "🎉 Welcome to Our App!",
        welcomeTemplate(fullName, username)
      );
    } catch (emailErr) {
      console.warn("Email sending failed:", emailErr); // log but don't crash
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Account WHERE Email = @email");
    const user = result.recordset[0];

    if (!user) {
      res.status(404).json({ message: "Email not found" });
      return;
    }

    // Generate a reset token (valid for 1 hour)
    // Generate a secure random reset token (hex string)
    const resetToken =
      Math.random().toString(36).substr(2) + Date.now().toString(36);

    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the reset token in DB
    await pool
      .request()
      .input("userId", sql.Int, user.AccountID)
      .input("resetToken", sql.VarChar, resetToken)
      .input("resetTokenExpiry", sql.DateTime2, resetTokenExpiry)
      .query(
        "UPDATE Account SET ResetToken = @resetToken, ResetTokenExpiry = @resetTokenExpiry WHERE AccountID = @userId"
      );

    // You might want to store this token in DB for verification later

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "🔑 Password Reset Request",
      passwordReset(user.FullName, resetLink)
    );

    res.json({ message: "Password reset email sent" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Verifies a password reset token.
 * @param token The JWT reset token to verify.
 * @returns The decoded payload if valid, or null if invalid/expired.
 */
export async function postVerifyResetToken(
  req: Request,
  res: Response
): Promise<void> {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ valid: false, message: "Token is required" });
    return;
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("resetToken", sql.VarChar, token)
      .query(
        "SELECT ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken"
      );
    const user = result.recordset[0];

    if (!user) {
      res.json({ valid: false, message: "Invalid or expired token" });
      return;
    }

    if (
      !user.ResetTokenExpiry ||
      new Date(user.ResetTokenExpiry) < new Date()
    ) {
      res.json({ valid: false, message: "Token has expired" });
      return;
    }

    res.json({ valid: true });
  } catch (err) {
    res.json({ valid: false, message: "Server error" });
  }
}

/**
 * Resets the user's password using a valid reset token.
 * Expects { token, newPassword, confirmPassword } in req.body.
 */
export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token || !newPassword || !confirmPassword) {
    res
      .status(400)
      .json({
        message: "Token, new password, and confirm password are required",
      });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match" });
    return;
  }

  try {
    const pool = await poolPromise;

    // Find user by reset token and check expiry
    const result = await pool
      .request()
      .input("resetToken", sql.VarChar, token)
      .query(
        "SELECT AccountID, ResetTokenExpiry FROM Account WHERE ResetToken = @resetToken"
      );
    const user = result.recordset[0];

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Check if token is expired
    if (
      !user.ResetTokenExpiry ||
      new Date(user.ResetTokenExpiry) < new Date()
    ) {
      res.status(400).json({ message: "Token has expired" });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and invalidate reset token
    await pool
      .request()
      .input("userId", sql.Int, user.AccountID)
      .input("password", sql.VarChar, hashedPassword)
      .query(
        "UPDATE Account SET Password = @password, ResetToken = NULL, ResetTokenExpiry = NULL WHERE AccountID = @userId"
      );

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
}
