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
        return next(); // Allow access for Guest role without token
      }
      console.log("No token provided");
      res.status(401);
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        console.log("Token verification failed", err);
        return res.status(403);
      }

      (req as any).user = decoded; // Attach user info to request

      const userRole = (decoded as any).role as Role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    });
  };

export default authorizeRoles;
