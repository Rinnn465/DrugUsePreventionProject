import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    role: string;
    id: string;
  };
}

export const restrictToAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user exists in request (should be set by auth middleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required"
      });
      return;
    }

    // Check admin role
    if (req.user.role.toLowerCase() !== "admin") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin privileges required"
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Export with the name that matches what's being imported
export const restrictToAdminMiddleware = restrictToAdmin;