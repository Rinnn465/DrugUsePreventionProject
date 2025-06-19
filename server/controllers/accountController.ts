import { NextFunction, Request, Response } from "express";
import { poolPromise, sql } from "../config/database";
import { Account } from "../types/type";

// Get all accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT Account.*, Role.RoleName FROM Account JOIN Role ON Account.RoleID = Role.RoleID");
    res.json(result.recordset as Account[]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
      res.status(400).json({ message: "Invalid role" });
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
      res.status(400).json({ message: "Invalid role" });
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
      res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update account profile
export const updateAccountProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password, fullName, dateOfBirth } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AccountID", sql.Int, parseInt(req.params.id, 10))
      .input("Username", sql.VarChar, username)
      .input("Email", sql.VarChar, email)
      .input("Password", sql.VarChar, password)
      .input("FullName", sql.VarChar, fullName)
      .input("DateOfBirth", sql.Date, dateOfBirth).query(`UPDATE Account SET 
        Username=@Username, 
        Email=@Email, 
        Password=@Password, 
        FullName=@FullName, 
        DateOfBirth=@DateOfBirth
        WHERE AccountID=@AccountID`);
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Account not found" });
      return;
    }
    res.json({ message: "Profile updated" });
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

