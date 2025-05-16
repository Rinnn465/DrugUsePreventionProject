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
// import ProgramsPage from './pages/ProgramsPage';
// import ProgramDetailPage from './pages/ProgramDetailPage';
// import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
// import CounselorsPage from './pages/CounselorsPage';
// import CounselorDetailPage from './pages/CounselorDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/Login';
import SignUp from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage /> || <NotFoundPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="assessments/:id" element={<AssessmentDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          {/* <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:id" element={<ProgramDetailPage />} />
          <Route path="dashboard" element={<DashboardPage />} /> */}
          <Route path="profile/:userid" element={<ProfilePage />} />
          {/* <Route path="counselors" element={<CounselorsPage />} />
          <Route path="counselors/:id" element={<CounselorDetailPage />} /> */}
          <Route path="error" element={<NotFoundPage />} />
          <Route path="events-meetings" element={<NotFoundPage />} />
          <Route path="feedback" element={<NotFoundPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;