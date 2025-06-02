import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BadgeCheck } from 'lucide-react';
import { Course } from '../../types/Course';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {course.category}
        </div>
        <div className="absolute bottom-4 left-4 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
          {course.audience}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 h-[56px]">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.enrolledCount} người đã tham gia</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {course.isCertified && (
            <div className="flex items-center text-success-600 text-sm">
              <BadgeCheck className="h-4 w-4 mr-1" />
              <span>Chứng chỉ</span>
            </div>
          )}

          <Link
            to={`/courses/${course.id}`}
            className="bg-primary-600 text-white font-medium py-2 px-4 rounded hover:bg-primary-700 transition-colors"
          >
            Xem khóa học
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;