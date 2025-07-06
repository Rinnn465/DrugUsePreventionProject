import React, { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import CourseCard from '../../components/courses/CourseCard';
import { Category, SqlCourse } from '@/types/Course';

const audienceFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Học sinh', value: 'Học sinh' },
  { label: 'Phụ huynh', value: 'Phụ huynh' },
  { label: 'Giáo viên', value: 'Giáo viên' },
  { label: 'Cộng đồng', value: 'Cộng đồng' },
];

const CoursesPage: React.FC = () => {
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [courses, setCourses] = useState<SqlCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');

  // Map course audience based on course name or category
  const getAudienceLabel = (courseName: string) => {
    if (courseName.includes('Thiếu Niên') || courseName.includes('Thanh Thiếu Niên') || courseName.includes('Hỗ Trợ Viên')) {
      return 'Học sinh';
    } else if (courseName.includes('Phụ Huynh')) {
      return 'Phụ huynh';
    } else if (courseName.includes('Lớp Học')) {
      return 'Giáo viên';
    } else if (courseName.includes('Cộng Đồng')) {
      return 'Cộng đồng';
    }
    return 'Tất cả';
  };

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

  // Filter courses by search and audience
  const filteredCourses = courses.filter(course => {
    const audience = getAudienceLabel(course.CourseName);
    const matchesAudience = selectedAudience === 'all' || audience === selectedAudience;
    const matchesSearch =
      course.CourseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.Description && course.Description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAudience && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
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

      <div className="container mx-auto px-4 py-10">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 items-center justify-center">
          {audienceFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setSelectedAudience(f.value)}
              className={`px-5 py-2 rounded-full font-medium border transition-colors duration-150 text-sm md:text-base
                ${selectedAudience === f.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center mb-4">{error}</div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course.CourseID} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-gray-600">Hãy thử từ khóa khác hoặc kiểm tra lại chính tả.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;