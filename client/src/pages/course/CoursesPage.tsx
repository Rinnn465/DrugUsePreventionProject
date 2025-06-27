import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import CourseCard from '../../components/courses/CourseCard';
import { Category, SqlCourse } from '@/types/Course';

// Define SqlCourse interface to ensure Category is an array
const CoursesPage: React.FC = () => {
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [courses, setCourses] = useState<SqlCourse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Transform API data to match SqlCourse type
  const transformCourseData = (apiData: any[]): SqlCourse[] => {
    return apiData.map(course => ({
      CourseID: course.CourseID,
      CourseName: course.CourseName,
      Risk: course.Risk,
      Description: course.Description,
      ImageUrl: course.ImageUrl,
      EnrollCount: course.EnrollCount,
      Duration: null,
      Status: course.Status || 'Available',
      IsDisabled: course.IsDisabled || false,
      Category: [{ CategoryID: course.CategoryID, CategoryName: course.CategoryName }],
    }));
  };

  useEffect(() => {
    // Fetch courses
    fetch('http://localhost:5000/api/course')
      .then(response => response.json())
      .then(data => setCourses(transformCourseData(data.data)))
      .catch(error => {
        console.error('Error fetching courses:', error);
        setError('Không thể tải khóa học. Vui lòng thử lại sau.');
      });

    // Fetch categories
    fetch('http://localhost:5000/api/course/category')
      .then(response => response.json())
      .then(data => setCategoryData(data.data))
      .catch(error => {
        console.error('Error fetching course categories:', error);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      });

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              Khóa học Chuyên nghiệp
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Tìm hiểu các kỹ năng phòng chống ma túy theo từng độ tuổi và đối tượng
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center mb-4">{error}</div>
        )}

        {/* Course Results Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Danh sách khóa học
                {courses.length > 0 && (
                  <span className="text-primary-600"> ({courses.length} khóa học)</span>
                )}
              </h2>
              <p className="text-gray-600">Chọn khóa học phù hợp với nhu cầu của bạn</p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.CourseID} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Chưa có khóa học</h3>
                <p className="text-gray-600">Hãy quay lại sau để xem những khóa học mới nhất</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;