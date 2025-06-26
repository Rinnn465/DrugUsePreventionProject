import express, { Application } from "express";
import cors from "cors";
import apiAccountRoutes from "./routes/accountRoutes";
import apiSurveyRoutes from "./routes/surveyRoutes";
import apiAuthenRoutes from "./routes/authenRoutes";
import apiArticleRoutes from "./routes/articleRoutes";
import apiProgramRoutes from "./routes/programRoutes";
import courseRoutes from "./routes/courseRoutes";
import consultantRoutes from "./routes/consultantRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import authorizeRoles from "./middleware/authenMiddleware";
import apiProgramAttendeeRoutes from "./routes/programAttendeeRoutes";
import lessonRoutes from "./routes/lessonRoutes";

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

// Public Article Routes (accessible to all including guests)
app.use(
  "/api/article",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  apiArticleRoutes
);

// Protected Article Routes (accessible to Staff, Manager, Admin)
app.use(
  "/api/article/admin",
  authorizeRoles(["Staff", "Manager" ,"Admin"]),
  apiArticleRoutes
);

// Authentication routes (login, register, password reset, etc.)
app.use("/api/auth", apiAuthenRoutes);

// Course routes (viewable by all roles)
app.use(
  "/api/course",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  courseRoutes
);

// Program routes (viewable by all roles, enrollment restricted in controller)
app.use(
  "/api/programs",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  apiProgramRoutes
);

// Program attendee routes (role-based authorization handled in each route)
app.use(
  "/api/program-attendee",
  apiProgramAttendeeRoutes // No global middleware, handled per route
);

// Consultant routes (viewable by all roles)
app.use(
  "/api/consultant",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  consultantRoutes
);

// Survey routes (restricted to Member, Consultant, Admin)
app.use(
  "/api/survey",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  apiSurveyRoutes
);

// Account routes (profile update for Member, Consultant, Admin)
app.use(
  "/api/account",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  apiAccountRoutes
);

// Appointment routes (viewable by all roles)
app.use(
  "/api/appointment",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  appointmentRoutes
);

// Admin-only routes (full management for each resource)
app.use("/api/account/admin", authorizeRoles(["Admin"]), apiAccountRoutes);
app.use("/api/survey/admin", authorizeRoles(["Admin"]), apiSurveyRoutes);
app.use("/api/program/admin", authorizeRoles(["Admin"]), apiProgramRoutes);
app.use("/api/article/admin", authorizeRoles(["Admin"]), apiArticleRoutes);
app.use("/api/course/admin", authorizeRoles(["Admin"]), courseRoutes);
app.use("/api/lesson/admin", authorizeRoles(["Admin"]), lessonRoutes);
app.use("/api/consultant/admin", authorizeRoles(["Admin"]), consultantRoutes);
app.use("/api/appointment/admin", authorizeRoles(["Admin"]), appointmentRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});