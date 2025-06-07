import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";

// TypeScript interface for Account (based on your SQL table)
interface Account {
  AccountID: number;
  Username: string;
  Email: string;
  Password: string;
  FullName: string;
  DateOfBirth: Date | null;
  Role: string;
  CreatedAt: Date;
  IsDisabled: boolean;
  ResetToken?: string | null;
}

// Get all accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Account");
    res.json(result.recordset as Account[]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

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
      .query("SELECT * FROM Account WHERE AccountID = @AccountID");

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Account not found" });
      return;
    }

    res.json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create new account
export const createAccount = async (req: Request, res: Response) => {
  const { username, email, password, fullName, dateOfBirth, role } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("Role", sql.NVarChar, role)
      .input("CreatedAt", sql.DateTime2, new Date())
      .query(`INSERT INTO Account 
        (Username, Email, Password, FullName, DateOfBirth, Role, CreatedAt) 
        VALUES (@Username, @Email, @Password, @FullName, @DateOfBirth, @Role, @CreatedAt)`);
    res.status(201).json({ message: "Account created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update account
export const updateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password, fullName, dateOfBirth, role, isDisabled } =
    req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .input("Username", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, password)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("Role", sql.NVarChar, role)
      .input("IsDisabled", sql.Bit, isDisabled).query(`UPDATE Account SET 
        Username=@Username, 
        Email=@Email, 
        Password=@Password, 
        FullName=@FullName, 
        DateOfBirth=@DateOfBirth, 
        Role=@Role, 
        IsDisabled=@IsDisabled
        WHERE AccountID=@AccountID`);
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
      res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
