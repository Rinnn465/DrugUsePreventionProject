import express, { Application } from "express";
import cors from "cors";
import apiAccountRoutes from "./routes/accountRoutes";
import apiSurveyRoutes from "./routes/surveyRoutes";
import authenRoutes from "./routes/authenRoutes";
import articleRoutes from "./routes/articleRoutes";
import programRoutes from "./routes/programRoutes";
import courseRoutes from "./routes/courseRoutes";
import consultantRoutes from "./routes/consultantRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import authorizeRoles from "./middleware/authenMiddleware";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // Enable CORS with credentials

// Public Routes (accessible to all including guests)
app.use(
  "/api/article",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  articleRoutes
);
app.use("/api/auth", authenRoutes);

app.use(
  "/api/course",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  courseRoutes
);
app.use(
  "/api/program",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  programRoutes
);
app.use(
  "/api/consultant",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  consultantRoutes
);

app.use(
  "/api/survey",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  apiSurveyRoutes
);

// Protected Routes - Member/Consultant can update profiles (excluding role changes)
app.use(
  "/api/account",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  apiAccountRoutes
);

app.use(
  "/api/appointment",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  appointmentRoutes
);


// Admin-only Routes - Full account management including role changes
app.use("/api/account/admin", authorizeRoles(["Admin"]), apiAccountRoutes);
// Admin-only Routes - Full survey management
app.use("/api/survey/admin", authorizeRoles(["Admin"]), apiSurveyRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
