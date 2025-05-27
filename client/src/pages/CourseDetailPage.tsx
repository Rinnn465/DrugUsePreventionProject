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
                    {/* <div className="flex items-center space-x-4 mb-6">
                    </div> */}
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Nội dung khóa học:</h2>
                    <div className="space-y-4">
                        {course.lesson.map((lesson) => (
                            <Link
                                to={`/courses/${id}/details/${lesson.id}`}

                            >
                                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="space-y-2">
                                        <p className="text-gray-600">{lesson.briefDescription}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div >
        );
    }
};

export default CourseDetailPage;