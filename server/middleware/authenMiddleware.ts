import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

type Role = "Admin" | "Consultant" | "Member" | "Guest"; // Define roles as needed

const authorizeRoles =
  (allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
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

     jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        res.status(403).json({ message: "Invalid or expired token" });
        return;
      }

      (req as any).user = decoded;
      const userRole = (decoded as any).user?.Role as Role;
      console.log("Decoded role:", userRole, "Allowed roles:", allowedRoles);

      if (!userRole || !allowedRoles.includes(userRole)) {
        res.status(403).json({ message: "Forbidden: Role not allowed" });
        return;
      }
      next();
    });
  };

export default authorizeRoles;