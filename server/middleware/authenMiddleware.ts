import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { poolPromise, sql } from "../config/database";

dotenv.config();


const authorizeRoles =
  (allowedRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        if (allowedRoles.includes("Guest")) {
          return next();
        }
        console.log("No token provided");
        res.status(401).json({ message: "No token provided" });
        return;
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        (req as any).user = decoded;

        const userRoleID = decoded.user?.RoleID as number;
        const userAccountID = decoded.user?.AccountID as number;
        if (!userRoleID || !userAccountID) {
          res.status(403).json({ message: "Token không hợp lệ: Không tìm thấy RoleID hoặc ID tài khoản" });
          return;
        }

        // Query the Role table to get the RoleName and check account status
        const pool = await poolPromise;
        const [roleResult, accountResult] = await Promise.all([
          pool
            .request()
            .input("RoleID", sql.Int, userRoleID)
            .query("SELECT RoleName FROM Role WHERE RoleID = @RoleID"),
          pool
            .request()
            .input("AccountID", sql.Int, userAccountID)
            .query("SELECT IsDisabled FROM Account WHERE AccountID = @AccountID")
        ]);

        const userRoleName = roleResult.recordset[0]?.RoleName as string;
        const accountData = accountResult.recordset[0];

        if (!userRoleName || !allowedRoles.includes(userRoleName)) {
          res.status(403).json({ message: "Bạn không có quyền truy cập trang này" });
          return;
        }
        // Check if account is disabled
        if (accountData?.IsDisabled) {
          res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa." });
          return;
        }

        next();
      } catch (err: any) {
        console.log("Token verification failed:", err.message);
        res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      }
    };

export default authorizeRoles;