import React from "react";
import { useParams } from "react-router-dom";
import { courseData } from "../data/courseData";
import { Link } from "react-router-dom";

const CourseDetailPage: React.FC = () => {
    const { id } = useParams();

    const course = courseData.find(course => course.id === Number(id));
    if (course) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
                    <p className="text-gray-600 text-lg mb-6">{course.description}</p>
                    <div className="flex items-center space-x-4 mb-6">
                        <span className="text-sm text-gray-500">Thời lượng: {course.duration}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Nội dung khóa học:</h2>
                    <div className="space-y-4">
                        {course.modules.map((module) => (
                            <Link to={`/courses/${id}/details/${module.id}`}>
                                <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Module {module.id}</h3>
                                    <div className="space-y-2">
                                        {module.lesson.map((lesson, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                                            >
                                                <p className="text-gray-600">{lesson.briefDescription}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {/* them 1 route lesson khi nguoi dung nhan vao tung module */}
                    </div>
                </div>
            </div >
        );
    }
};

export default CourseDetailPage;