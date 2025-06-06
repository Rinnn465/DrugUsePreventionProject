import express, { Application } from "express";
import cors from "cors";
import apiAccountRoutes from "./routes/accountRoutes";
import authRoutes from "./routes/authenRouter";
import authenticateToken from "./middleware/authMiddleware";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Public Auth Routes
app.use("/api/auth", authRoutes);

// JWT Middleware for all other routes
app.use(authenticateToken);

// Protected Routes
app.use("/api/account", apiAccountRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
