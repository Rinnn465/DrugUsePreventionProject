import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, BadgeCheck, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { courseData } from '../data/courseData';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams();
  const course = courseData.find(c => c.id === Number(id));

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-8">The course you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/courses"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Courses
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
            Back to Courses
          </Link>
        </div>

        {/* Course Header */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                {course.category}
              </span>
              <span className="bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full">
                {course.audience}
              </span>
              {course.isCertified && (
                <span className="bg-success-100 text-success-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1" />
                  Certificate Included
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-6 text-gray-600">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                <span>{course.enrolledCount} enrolled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          <div className="space-y-4">
            {course.modules.map((module, index) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.duration}</p>
                  </div>
                </div>
                {module.completed && (
                  <CheckCircle className="h-5 w-5 text-success-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div className="max-w-4xl mx-auto bg-primary-50 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-700 mb-6">
            Join {course.enrolledCount} others who have already enrolled in this course.
          </p>
          <button className="bg-primary-600 text-white px-8 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors font-medium">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;