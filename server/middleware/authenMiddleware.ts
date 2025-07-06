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
        if (!userRoleID) {
          res.status(403).json({ message: "Invalid token: No role ID found" });
          return;
        }

        // Query the Role table to get the RoleName
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("RoleID", sql.Int, userRoleID)
          .query("SELECT RoleName FROM Role WHERE RoleID = @RoleID");

        const userRoleName = result.recordset[0]?.RoleName as string;
        if (!userRoleName || !allowedRoles.includes(userRoleName)) {
          res.status(403).json({ message: "Forbidden: Role not allowed" });
          return;
        }

        next();
      } catch (err: any) {
        console.log("Token verification failed:", err.message);
        res.status(403).json({ message: "Invalid or expired token" });
      }
    };

export default authorizeRoles;