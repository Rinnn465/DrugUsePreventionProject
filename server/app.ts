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
app.use("/api/articles", authorizeRoles(["Guest", "Memeber", "Consultant", "Admin"]), articleRoutes
);
app.use("/api/auth", authenRoutes);

app.use("/api/courses", authorizeRoles(["Guest", "Memeber", "Consultant", "Admin"]), courseRoutes
);
app.use("/api/program", authorizeRoles(["Guest", "Memeber", "Consultant", "Admin"]), programRoutes
);
app.use("/api/consultants", authorizeRoles(["Guest", "Memeber", "Consultant", "Admin"]), consultantRoutes
);

app.use("/api/surveys", authorizeRoles(["Memeber", "Consultant", "Admin"]), apiSurveyRoutes
);


// Protected Routes - Member/Consultant can update profiles (excluding role changes)
app.use("/api/account", authorizeRoles(["Memeber", "Consultant", "Admin"]), apiAccountRoutes
);

app.use(
  "/api/appointments",
  authorizeRoles(["Guest", "Memeber", "Consultant", "Admin"]),
  appointmentRoutes
);

// Admin-only Routes - Full account management including role changes
app.use("/api/account/admin", authorizeRoles(["Admin"]), apiAccountRoutes);

// Admin-only Routes for managing programs
app.use("/api/program/admin", authorizeRoles(["Admin"]),programRoutes);

// Admin-only Routes for managing surveys
app.use("/api/survey/admin", authorizeRoles(["Admin"]), apiSurveyRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
