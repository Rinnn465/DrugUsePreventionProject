import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssessmentsPage from './pages/AssessmentsPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DashBoardPage from './pages/DashBoardPage';
import SurveyBeforeEventPage from './pages/SurveyBeforeEventPage';
import CourseEnrollPage from './pages/CourseEnrollPage';
// import ProgramsPage from './pages/ProgramsPage';
// import ProgramDetailPage from './pages/ProgramDetailPage';
// import CounselorsPage from './pages/CounselorsPage';
// import CounselorDetailPage from './pages/CounselorDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignupPage';
import EventPage from './pages/CommunityProgramPage';
import AuthLayout from './components/AuthLayout';
import EventsDetails from './pages/ProgramDetailsPage';
import ConsultantDetailsPage from './pages/ConsultantDetailsPage';
import RolePage from './pages/RolePage';
import LessonDetailsPage from './pages/LessonDetailsPage';
import SurveyCompletePage from './pages/SurveyCompletePage';
import SurveyAfterEventPage from './pages/SurveyAfterEventPage';
import CourseManagmentPage from './pages/CourseManagmentPage';
import EventManagmentPage from './pages/EventManagmentPage';
import EmployeeManagmentPage from './pages/EmployeeManagmentPage';
import MemberManagmentPage from './pages/MemberManagmentPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { UserProvider } from './context/UserContext';
import ArticlePage from './pages/ArticlePage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import CommunityProgramPage from './pages/CommunityProgramPage';
import CommunityProgramDetails from './pages/ProgramDetailsPage';

function App() {
  return (
    <UserProvider >
      <Router>
        <Routes>
          {/* header and footer included */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="article" element={<ArticlePage />} />
            <Route path="article/:articleId" element={<ArticleDetailsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseEnrollPage />} />
            <Route path="courses/:id/details/" element={<CourseDetailPage />} />
            <Route path="courses/:id/details/:lessonId" element={<LessonDetailsPage />} />
            <Route path="consultant/:consultantId" element={<ConsultantDetailsPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/:assessmentId" element={<AssessmentDetailPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            {/* <Route path="profile/:userId" element={<ProfilePage />} /> */}
            <Route path="community-programs" element={<CommunityProgramPage />} />
            <Route path="community-programs/:programId" element={<CommunityProgramDetails />} />
            <Route path="survey/:programId/before" element={<SurveyBeforeEventPage />} />
            <Route path="survey/:programId/after" element={<SurveyAfterEventPage />} />
            <Route path="survey/:programId/completed" element={<SurveyCompletePage />} />
            <Route path="dashboard/:userId" element={<DashBoardPage />} />
            <Route path="roles/:userId" element={<RolePage />} />

            <Route path="roles/:userId/course-manage" element={<CourseManagmentPage />} />
            <Route path="roles/:userId/event-manage" element={<EventManagmentPage />} />
            <Route path="roles/:userId/employee-manage" element={<EmployeeManagmentPage />} />
            <Route path="roles/:userId/member-manage" element={<MemberManagmentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>


          {/* different layout with no header and footer included */}
          <Route path="" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>

  );
}

export default App;