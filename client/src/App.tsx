import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssessmentsPage from './pages/AssessmentsPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import FeedbackPage from './pages/FeedbackPage';
import DashBoardPage from './pages/DashBoardPage';
import CourseEnrollPage from './pages/CourseEnrollPage';
// import ProgramsPage from './pages/ProgramsPage';
// import ProgramDetailPage from './pages/ProgramDetailPage';
import ProfilePage from './pages/ProfilePage';
// import CounselorsPage from './pages/CounselorsPage';
// import CounselorDetailPage from './pages/CounselorDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignupPage';
import EventPage from './pages/EventsPage';
import AuthLayout from './components/AuthLayout';
import EventsDetails from './pages/EventDetailsPage';
import CounselorDetailPage from './pages/CounselorDetailsPage';
import RolePage from './pages/RolePage';
import ModuleDetailsPage from './pages/LessonDetailsPage';
import BlogDetailsPage from './pages/BlogDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* header and footer included */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:blogId" element={<BlogDetailsPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseEnrollPage />} />
          <Route path="courses/:id/details/" element={<CourseDetailPage />} />
          <Route path="courses/:id/details/:lessonId" element={<ModuleDetailsPage />} />
          <Route path="counselor/:counselorId" element={<CounselorDetailPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="assessments/:id" element={<AssessmentDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="events" element={<EventPage />} />
          <Route path="events/:id" element={<EventsDetails />} />
          <Route path="feedback/:eventId" element={<FeedbackPage />} />
          <Route path="dashboard/:userId" element={<DashBoardPage />} />
          <Route path="roles/:userId" element={<RolePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>


        {/* different layout with no header and footer included */}
        <Route path="" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;