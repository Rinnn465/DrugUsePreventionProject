import express, { Application } from "express";
import cors from "cors";
import apiAccountRoutes from "./routes/accountRoutes";
import articleRoutes from "./routes/articleRoutes";
import authenRoutes from "./routes/authenRoutes";
import surveyRoutes from "./routes/surveyRoutes";
import programRoutes from "./routes/programRoutes";
import authenticateToken from "./middleware/authenMiddleware";
import courseRoutes from "./routes/courseRoutes";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
})); // Enable CORS with credentials

// Public Routes
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authenRoutes);
app.use("/api/courses", courseRoutes)

// JWT Middleware for all other routes
app.use(authenticateToken);

// Protected Routes
app.use("/api/account", apiAccountRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/programs", programRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});