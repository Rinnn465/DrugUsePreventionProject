import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  Award,
  Play,
  FileText,
} from 'lucide-react';
import { Enrollment, SqlCourse } from '../../types/Course';
import { sqlLesson } from '../../types/Lesson';
import useAuthToken from '../../hooks/useAuthToken';
import useModal from '../../hooks/useModal';
import Modal from '../../components/modal/ModalNotification';
import { useUser } from '@/context/UserContext';
import { parseSqlDate } from '@/utils/parseSqlDateUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseEnrollPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<SqlCourse | null>(null);
  const [sqlLessons, setSqlLessons] = useState<sqlLesson[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);

  const { token } = useAuthToken();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const courseResponse = await fetch(`${API_URL}/api/course/${id}`);
      if (!courseResponse.ok) {
        throw new Error('Không thể tải thông tin khóa học.');
      }
      const courseData = await courseResponse.json();
      setCourse(courseData.data);
      console.log('Course Data:', courseData.data);

      const lessonResponse = await fetch(`${API_URL}/api/course/${id}/lessons`);
      if (!lessonResponse.ok) {
        throw new Error('Không thể tải bài học.');
      }
      const lessonData = await lessonResponse.json();
      setSqlLessons(lessonData.data ?? []);
      console.log('Lessons:', lessonData.data);
    } catch (error) {
      console.error('Error fetching course or lessons:', error);
      setError('Đã xảy ra lỗi khi tải khóa học. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    if (!token || !user?.AccountID) {
      console.log('Skipping fetchEnrolledCourses: No token or user');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/course/${user.AccountID}/enrolled/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Không thể tải danh sách khóa học đã đăng ký.`);
      }
      const data = await response.json();
      console.log(`Enrolled Courses Response for Course ${id}:`, data);
      setEnrolledCourses(data.data ?? []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError('Đã xảy ra lỗi khi kiểm tra trạng thái đăng ký.');
    }
  };

  const fetchCompleteCourseData = async () => {
    if (token && user?.AccountID) {
      try {
        const response = await fetch(`${API_URL}/api/course/${id}/completed/${user.AccountID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await response.json();
        if (data.data?.[0]?.Status === 'Completed') {
          setIsCourseCompleted(true);
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      }
    }
  };

  useEffect(() => {
    fetchCourseData();
    fetchEnrolledCourses();
    fetchCompleteCourseData();
  }, [id, token, user]);

  const handleEnroll = async () => {
    if (!token) {
      openModal();
      return;
    }

    if (!user?.AccountID) {
      toast.error('Thông tin người dùng không hợp lệ.');
      return;
    }

    const isEnrolled = enrolledCourses.some(
      (c) => c.AccountID === user.AccountID && c.CourseID === Number(id)
    );

    if (isEnrolled) {
      navigate(`/courses/${id}/lessons`);
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await fetch(`${API_URL}/api/course/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: Number(id),
          accountId: user.AccountID,
          enrollmentDate: parseSqlDate(new Date().toISOString()),
          status: 'Studying',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? 'Đăng ký khóa học không thành công.');
      }

      // Update enrolledCourses locally
      const newEnrollment: Enrollment = {
        AccountID: user.AccountID,
        CourseID: Number(id),
        EnrollDate: new Date(),
        CompletionDate: new Date(),
        Status: 'Studying',
      };
      setEnrolledCourses((prev) => [...prev, newEnrollment]);

      // Re-fetch enrolled courses to ensure consistency
      await fetchEnrolledCourses();

      toast.success('Đăng ký khóa học thành công!');
      setTimeout(() => {
        navigate(`/courses/${id}/lessons`);
      }, 1500);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng ký khóa học.';
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = () => {
    const ConfirmToast: React.FC<{ closeToast?: () => void }> = ({ closeToast }) => (
      <div>
        <div className="font-semibold mb-2">Xác nhận hủy đăng ký</div>
        <div className="mb-4 text-sm text-gray-700">Bạn có chắc chắn muốn hủy đăng ký khóa học này? Hành động này không thể hoàn tác.</div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
            onClick={closeToast}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
            onClick={async () => {
              closeToast && closeToast();
              await confirmUnenroll();
            }}
          >
            Hủy đăng ký
          </button>
        </div>
      </div>
    );
    toast.info(<ConfirmToast />, { autoClose: false, closeOnClick: false, draggable: false });
  };

  const confirmUnenroll = async () => {
    if (!token || !user || !user.AccountID) {
      toast.error('Thông tin người dùng không hợp lệ.');
      return;
    }
    try {
      setIsEnrolling(true);
      const response = await fetch(`${API_URL}/api/course/${id}/unenroll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: user.AccountID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Hủy đăng ký khóa học không thành công.');
      }

      setEnrolledCourses((prev) =>
        prev.filter(enrollment =>
          !(enrollment.AccountID === user.AccountID && enrollment.CourseID === Number(id))
        )
      );
      await fetchEnrolledCourses();
      toast.success('Hủy đăng ký khóa học thành công!');
    } catch (error: unknown) {
      console.error('Error unenrolling from course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi hủy đăng ký khóa học.';
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  const isUserEnrolled = enrolledCourses.some(
    (c) => c.AccountID === user?.AccountID && c.CourseID === Number(id)
  );

  const getButtonText = () => {
    if (isEnrolling) {
      return isUserEnrolled ? 'Đang xử lý...' : 'Đang đăng ký...';
    }
    return isUserEnrolled ? 'Tiếp tục học' : 'Tham gia khóa học';
  };

  const getRandomEnrollmentCount = () => {
    return Math.floor(Math.random() * 500) + 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Đang tải khóa học...</h2>
          <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error ?? 'Không tìm thấy khóa học'}
          </h1>
          <p className="text-gray-600 mb-8">Khóa học không tồn tại hoặc có lỗi xảy ra.</p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại trang Khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#2563eb' }}
    >
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Bạn cần đăng nhập"
        description="Vui lòng đăng nhập để tham gia khóa học này."
        confirmMessage="Đăng nhập ngay"
        confirmUrl={() => {
          navigate('/login');
        }}
      />

      {/* Header Section */}
      <div className="relative bg-transparent text-white">
        <div className="relative container mx-auto px-6 py-12">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              to="/courses"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại trang Khóa học
            </Link>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {course.CourseName}
                </h1>

                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  {course.Description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleEnroll}
                    disabled={isLoading || isEnrolling}
                    className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    <span>{getButtonText()}</span>
                  </button>

                  {isUserEnrolled && !isCourseCompleted && (
                    <button
                      onClick={handleUnenroll}
                      disabled={isLoading || isEnrolling}
                      className="flex items-center justify-center space-x-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold"
                    >
                      <span>{isEnrolling && isUserEnrolled ? 'Đang hủy...' : 'Hủy đăng ký'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Course Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={course.ImageUrl}
                    alt={course.CourseName}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Nội dung khóa học</h2>
              <p className="text-blue-700 text-lg">
                Học tập linh hoạt theo tiến độ của bạn
              </p>
            </div>

            <div className="space-y-4">
              {sqlLessons.length > 0 ? (
                sqlLessons.map((lesson, index) => (
                  <div
                    key={lesson.LessonID}
                    className="group bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition-all duration-200 border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold group-hover:bg-blue-600 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-900 mb-1 group-hover:text-blue-700 transition-colors">
                            {lesson.Title}
                          </h3>
                          <p className="text-blue-700 mb-2">{lesson.BriefDescription}</p>
                          <div className="flex items-center space-x-4 text-sm text-blue-700">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{lesson.Duration} phút</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="w-8 h-8 bg-blue-200 group-hover:bg-blue-300 rounded-full flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                  <p className="text-blue-700 text-lg">Chưa có bài học nào cho khóa học này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 bg-blue-100 text-blue-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình học tập?</h2>
            {/* <p className="text-xl text-blue-900/90 mb-8">
              Tham gia cùng hơn {getRandomEnrollmentCount()} học viên khác và nâng cao kiến thức của bạn ngay hôm nay
            </p>
             */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleEnroll}
                disabled={isLoading || isEnrolling}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Award className="w-6 h-6" />
                <span>{getButtonText()}</span>
              </button>

              {isUserEnrolled && !isCourseCompleted && (
                <button
                  onClick={handleUnenroll}
                  disabled={isLoading || isEnrolling}
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold"
                >
                  <span>{isEnrolling && isUserEnrolled ? 'Đang hủy...' : 'Hủy đăng ký'}</span>
                </button>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-blue-700">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollPage;