import React, { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import CourseCard from '../components/courses/CourseCard';
import { courseData } from '../data/courseData';
import { Course, SqlCourse } from '../types/Course';

const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [courses, setCourses] = useState<SqlCourse[]>([]);


  // const filteredCourses = courseData.filter(course => {
  //   const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     course?.description.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
  //   const matchesAudience = selectedAudience === '' || course.audience === selectedAudience;

  //   return matchesSearch && matchesCategory && matchesAudience;
  // });

  // const categories = [...new Set(courseData.map(course => course.category))];
  // const audiences = [...new Set(courseData.map(course => course.audience))];

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(response => response.json())
      .then(data => {
        setCourses(data.data);
        console.log(data.data);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Khóa học online</h1>
          <p className="text-lg text-gray-600 mb-8">
            TÌm hiểu các kỹ năng phòng chống ma túy theo từng độ tuổi và đối tượng
          </p>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <select
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Lĩnh vực</option>
                  {/* {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))} */}
                </select>
                <select
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                >
                  <option value="">Đối tượng</option>
                  {/* {audiences.map((audience, index) => (
                    <option key={index} value={audience}>{audience}</option>
                  ))} */}
                </select>
              </div>
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
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600">Hãy thử tìm kiếm lại</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;