import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/about/AboutPage';
import CoursesPage from './pages/course/CoursesPage';
import AssessmentsPage from './pages/assessment/AssessmentsPage';
import AssessmentDetailPage from './pages/assessment/AssessmentDetailPage';
import AppointmentsPage from './pages/appointment/AppointmentsPage';
import DashBoardPage from './pages/DashBoardPage';
import SurveyBeforeEventPage from './pages/survey/SurveyBeforeEventPage';
import CourseEnrollPage from './pages/course/CourseEnrollPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/authen/LoginPage';
import SignUpPage from './pages/authen/SignupPage';
import AuthLayout from './components/AuthLayout';
import ConsultantDetailsPage from './pages/appointment/ConsultantDetailsPage';
import LessonDetailsPage from './pages/course/LessonDetailsPage';
import ExamPage from './pages/course/ExamPage';
import SurveyCompletePage from './pages/survey/SurveyCompletePage';
import SurveyAfterEventPage from './pages/survey/SurveyAfterEventPage';
import CourseManagmentPage from './pages/course/CourseManagmentPage';
import ProgramManagementPage from './pages/program/ProgramManagementPage';
import AccountManagementPage from './pages/management/AccountManagementPage';
import ArticleManagementPage from './pages/management/ArticleManagementPage';
import EmployeeManagmentPage from './pages/management/EmployeeManagementPage';
import MemberManagmentPage from './pages/management/MemberManagementPage';
import ForgotPasswordPage from './pages/authen/ForgotPasswordPage';
import ResetPasswordPage from './pages/authen/ResetPasswordPage';
import { UserProvider } from './context/UserContext';
import ArticlePage from './pages/article/ArticlePage';
import ArticleDetailsPage from './pages/article/ArticleDetailsPage';
import CommunityProgramPage from './pages/program/CommunityProgramPage';
import CommunityProgramDetails from './pages/program/CommunityProgramDetailsPage';
import AdminPage from './pages/management/AdminPage';
import ManagerPage from './pages/management/ManagerPage';
import ReportsPage from './pages/management/ReportsPage';
import ConsultantPage from './pages/management/ConsultantPage';
import ConsultantSchedule from './pages/management/ConsultantSchedule';
import AdminProfilePage from './pages/management/AdminProfilePage';
import ChangePasswordPage from './pages/management/ChangePasswordPage';
import RolePage from './pages/management/RolePage';
import VideoCallPage from '@/components/video/VideoCallPage';
import StaffPage from './pages/management/StaffPage';

function App() {
  return (
    <UserProvider>
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
            <Route path="courses/:id/lessons" element={<LessonDetailsPage />} />
            <Route path="courses/:id/exam" element={<ExamPage />} />
            <Route path="consultant/:consultantId" element={<ConsultantDetailsPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/:assessmentId" element={<AssessmentDetailPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="community-programs" element={<CommunityProgramPage />} />
            <Route path="community-programs/:programId" element={<CommunityProgramDetails />} />
            <Route path="survey/:programId/before" element={<SurveyBeforeEventPage />} />
            <Route path="survey/:programId/after" element={<SurveyAfterEventPage />} />
            <Route path="survey/:programId/completed" element={<SurveyCompletePage />} />
            <Route path="dashboard/:userId" element={<DashBoardPage />} />
            <Route path="dashboard/:userId/profile" element={<DashBoardPage />} />
            <Route path="dashboard/:userId/security" element={<DashBoardPage />} />
            <Route path="dashboard/:userId/courses" element={<DashBoardPage />} />
            <Route path="dashboard/:userId/events" element={<DashBoardPage />} />
            <Route path="dashboard/:userId/appointments" element={<DashBoardPage />} />
            <Route path="roles/:userId" element={<RolePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin/Manager/Staff routes - no header/footer */}
          <Route path="admin" element={<AdminPage />} />
          <Route path="consultant" element={<ConsultantPage />} />
          <Route path="consultant/schedule" element={<ConsultantSchedule />} />
          <Route path="manager" element={<ManagerPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="roles/:userId/course-manage" element={<CourseManagmentPage />} />
          <Route path="roles/:userId/program-manage" element={<ProgramManagementPage />} />
          <Route path="roles/:userId/reports" element={<ReportsPage />} />
          <Route path="roles/:userId/account-manage" element={<AccountManagementPage />} />
          <Route path="roles/:userId/admin-profile" element={<AdminProfilePage />} />
          <Route path="roles/:userId/change-password" element={<ChangePasswordPage />} />
          <Route path="roles/:userId/article-manage" element={<ArticleManagementPage />} />
          <Route path="roles/:userId/employee-manage" element={<EmployeeManagmentPage />} />
          <Route path="roles/:userId/member-manage" element={<MemberManagmentPage />} />

          <Route path='/video-call' element={<VideoCallPage />} />
          {/* different layout with no header and footer included */}
          <Route path="" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastStyle={{
            borderRadius: '12px',
            fontFamily: 'inherit',
            fontSize: '14px'
          }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;