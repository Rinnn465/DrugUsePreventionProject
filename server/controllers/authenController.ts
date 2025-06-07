import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql, poolPromise } from "../config/database";
import { sendEmail } from "./mailController";
import { welcomeTemplate } from "../templates/welcome";

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

    const token = jwt.sign(
      { user: user },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );


    res.status(200).json({
      message: "Login successful",
      token,
      user: { ...user, status: 'hello' }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export function logout(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ message: "Error logging out" });
      return;
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: "Logged out" });
  });
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
      .input("role", sql.NVarChar, role || "user")
      .input("createdAt", sql.DateTime2, new Date())
      .query(
        `INSERT INTO Account 
                (Username, Email, Password, FullName, DateOfBirth, Role, CreatedAt) 
                VALUES 
                (@username, @email, @password, @fullName, @dateOfBirth, @role, @createdAt)`
      );

      
      
    // Send welcome email
    await sendEmail(
      email,
      "🎉 Welcome to Our App!",
      welcomeTemplate(fullName, username)
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
