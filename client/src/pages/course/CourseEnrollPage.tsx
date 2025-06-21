import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowLeft } from 'lucide-react';
import { Enrollment, SqlCourse } from '../../types/Course';
import { sqlLesson } from '../../types/Lesson';
import useAuthToken from '../../hooks/useAuthToken';
import useModal from '../../hooks/useModal';
import Modal from '../../components/modal/ModalNotification';
import { useUser } from '@/context/UserContext';
import { parseSqlDate } from '@/utils/parseSqlDateUtils';
import { toast } from 'react-toastify';

const CourseEnrollPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<SqlCourse | null>(null);
  const [sqlLessons, setSqlLessons] = useState<sqlLesson[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthToken();
  const { user } = useUser();
  const { isOpen, openModal, closeModal } = useModal();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      setSqlLessons(lessonData.data || []);
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
      setEnrolledCourses(data.data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError('Đã xảy ra lỗi khi kiểm tra trạng thái đăng ký.');
    }
  };

  useEffect(() => {
    fetchCourseData();
    fetchEnrolledCourses();
  }, [id, token, user]);

  const handleEnroll = async () => {
    if (!token) {
      openModal();
      return;
    }

    if (!user || !user.AccountID) {
      toast.error('Thông tin người dùng không hợp lệ.');
      return;
    }

    const isEnrolled = enrolledCourses.some(
      (c) => c.AccountID === user.AccountID && c.CourseID === Number(id)
    );

    if (isEnrolled) {
      navigate(`/courses/${id}/details`);
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
        throw new Error(errorData.message || 'Đăng ký khóa học không thành công.');
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
        navigate(`/courses/${id}/details`);
      }, 1500);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi đăng ký khóa học.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đang tải...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Không tìm thấy khóa học'}
            </h1>
            <p className="text-gray-600 mb-8">Khóa học không tồn tại hoặc có lỗi xảy ra.</p>
            <Link
              to="/courses"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại trang Khóa học
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            to="/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại trang Khóa học
          </Link>
        </div>

        {/* Course Header */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <img src={course.ImageUrl} alt={course.CourseName} className="w-full h-64 object-cover" />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.CourseName}</h1>
            <p className="text-gray-600 text-lg mb-6">{course.Description}</p>

            <div className="flex flex-wrap gap-6 text-gray-600">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                <span>{course.Duration || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                <span>{course.EnrollCount} người đã tham gia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
          <div className="space-y-4">
            {sqlLessons.length > 0 ? (
              sqlLessons.map((lesson, index) => (
                <div
                  key={lesson.LessonID}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{lesson.Title}</h3>
                      <p className="text-md text-gray-500">{lesson.BriefDescription}</p>
                      <p className="text-sm text-gray-500">{lesson.Duration} phút</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Chưa có bài học nào cho khóa học này.</p>
            )}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div className="max-w-4xl mx-auto bg-primary-50 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Tham gia khóa học</h2>
          <p className="text-primary-700 mb-6">
            Tham gia cùng {course.EnrollCount} người khác
          </p>
          <button
            onClick={handleEnroll}
            disabled={isLoading || isEnrolling}
            className="bg-primary-600 text-white px-8 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {isEnrolling
              ? 'Đang đăng ký...'
              : enrolledCourses.some((c) => c.AccountID === user?.AccountID && c.CourseID === Number(id))
                ? 'Tiếp tục học'
                : 'Tham gia khóa học'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollPage;