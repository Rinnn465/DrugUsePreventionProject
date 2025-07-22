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
import apiProgramSurveyRoutes from "./routes/programSurveyRoutes";
import { updateProgramStatus } from "./controllers/scheduledProgram";
import agoraRoutes from "./routes/agoraRoutes";
import courseExamRoutes from "./routes/courseExamRoutes";
import apiLessonRoutes from "./routes/lessonRoutes";
import assessmentResultRoutes from './routes/assessmentResultRoutes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Public Routes
app.use(
  "/api/article",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Staff", "Manager"]),
  apiArticleRoutes
);
app.use("/api/auth", apiAuthenRoutes);
app.use(
  "/api/course",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Staff", "Manager"]),
  courseRoutes
);
app.use(
  "/api/program",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Staff", "Manager"]),
  apiProgramRoutes
);
app.use(
  "/api/program-attendee",
  apiProgramAttendeeRoutes
);
app.use(
  "/api/consultant",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Manager"]),
  consultantRoutes
);
app.use(
  "/api/survey",
  authorizeRoles(["Member", "Consultant", "Admin", "Manager"]),
  apiSurveyRoutes
);
app.use(
  "/api/program-survey",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Manager"]),
  apiProgramSurveyRoutes
);
app.use(
  "/api/lesson",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Manager"]),
  apiLessonRoutes
);
app.use(
  "/api/exam",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  courseExamRoutes
);
app.use(
  '/api/agora',
  authorizeRoles(['Member', 'Consultant', 'Admin']),
  agoraRoutes
);

// Protected Routes
app.use(
  "/api/account",
  apiAccountRoutes
);
app.use(
  "/api/appointment",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin", "Manager"]),
  appointmentRoutes
);

// Admin-only Routes (remove duplicate)
// app.use("/api/account/admin", authorizeRoles(["Admin"]), apiAccountRoutes);
app.use("/api/survey/admin", authorizeRoles(["Admin"]), apiSurveyRoutes);

// Start scheduled program status updates
updateProgramStatus();

app.use('/api/assessment', assessmentResultRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});