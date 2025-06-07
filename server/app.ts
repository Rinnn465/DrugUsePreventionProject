import express, { Application } from "express";
import cors from "cors";
import apiAccountRoutes from "./routes/accountRoutes";
import articleRoutes from "./routes/articleRoutes";
import authenRoutes from "./routes/authenRoutes";
import authenticateToken from "./middleware/authenMiddleware";


const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Article Routes
app.use("/api/articles", articleRoutes);

// Public Auth Routes
app.use("/api/auth", authenticateToken , authenRoutes);

// Protected Routes
app.use("/api/account", authenticateToken , apiAccountRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
