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

import apiLessonRoutes from "./routes/lessonRoutes";
import assessmentResultRoutes from './routes/assessmentResultRoutes';

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
  apiArticleRoutes
);
app.use("/api/auth", apiAuthenRoutes);

app.use(
  "/api/course",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  courseRoutes
);

// Program routes - Guest có thể xem, nhưng enrollment chỉ cho Member/Consultant/Admin
app.use(
  "/api/program",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  apiProgramRoutes
);

// Program attendee routes - Phân quyền cụ thể trong từng route
app.use(
  "/api/program-attendee",
  apiProgramAttendeeRoutes // Không apply middleware ở đây, để route tự xử lý
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

// Program survey routes
app.use(
  "/api/program-survey",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  apiProgramSurveyRoutes
);

app.use(
  "/api/lesson",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  apiLessonRoutes
);


// Protected Routes - Member/Consultant can update profiles (excluding role changes)
app.use(
  "/api/account",
  authorizeRoles(["Member", "Consultant", "Admin"]),
  apiAccountRoutes
);

app.use(
  "/api/appointment",
  authorizeRoles(["Guest", "Member", "Consultant", "Admin"]),
  appointmentRoutes
);

app.use('/api/agora',
  authorizeRoles(['Member', 'Consultant', 'Admin']),
  agoraRoutes);

// Admin-only Routes - Full account management including role changes
app.use("/api/account/admin", authorizeRoles(["Admin"]), apiAccountRoutes);
// Admin-only Routes - Full survey management
app.use("/api/survey/admin", authorizeRoles(["Admin"]), apiSurveyRoutes);
// Start scheduled program status updates
updateProgramStatus();

app.use('/api/assessment', assessmentResultRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});