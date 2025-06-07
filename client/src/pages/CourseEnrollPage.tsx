import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, BadgeCheck, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { courseData } from '../data/courseData';
import { SqlCourse } from '../types/Course';
import { sqlLesson } from '../types/Lesson';

const CourseEnrollPage: React.FC = () => {
  const { id } = useParams();
  // const course = courseData.find(c => c.id === Number(id));
  const [course, setCourse] = React.useState<SqlCourse | null>(null);
  const [sqlLessons, setSqlLessons] = React.useState<sqlLesson[] | null>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await fetch(`http://localhost:5000/api/courses/${id}`);
        const courseData = await courseResponse.json();
        setCourse(courseData.data);


        const lessonResponse = await fetch(`http://localhost:5000/api/courses/${id}/lessons`);
        const lessonData = await lessonResponse.json();
        console.log(lessonData);

        if (lessonData.data) {
          setSqlLessons(lessonData.data);
        }
      }
      catch (error) {
        console.error('Error fetching course or lessons:', error);
      }
    }

    fetchCourse();
  }, [])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h1>
            <p className="text-gray-600 mb-8">Khóa học không tồn tại.</p>
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
          <img
            src={course.ImageUrl}
            alt={course.CourseName}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                {course.Audience}
              </span> */}
              <span className="bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full">
                {course.Audience}
              </span>
              {/* {course.isCertified && (
                <span className="bg-success-100 text-success-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1" />
                  Được cấp chứng chỉ
                </span>
              )}  */}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.CourseName}</h1>
            <p className="text-gray-600 text-lg mb-6">{course.Description}</p>

            <div className="flex flex-wrap gap-6 text-gray-600">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                <span>{course.Duration}</span>
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
            {sqlLessons?.map((lesson, index) => (
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
                    <p className='text-md text-gray-500'>{lesson.BriefDescription}</p>
                    <p className="text-sm text-gray-500">{lesson.Duration} phút</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div className="max-w-4xl mx-auto bg-primary-50 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Bắt đầu học?</h2>
          <p className="text-primary-700 mb-6">
            Tham gia cùng {course.EnrollCount} người khác
          </p>
          <Link to={`/courses/${course.CourseID}/details/${course.CourseID}`}>
            <button
              className="bg-primary-600 text-white px-8 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors font-medium"
            >
              Bắt đầu học
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollPage;