import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { courseData } from "../data/courseData";
import { User, BookOpen, Calendar, Clock, Award, Users } from "lucide-react";

const DashBoardPage: React.FC = () => {
    const { userId } = useParams();
    const { user, setUser } = useUser();


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-grow p-6 lg:p-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Xin chào, {user?.Username}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Chào mừng bạn quay trở lại với hệ thống
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 lg:mt-0">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span className="font-medium">Email:</span>
                                    <span>{user?.Email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>Tham gia: {parseDate(`${user?.CreatedAt}`)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Khóa học tham gia</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{courseData.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Sự kiện tham gia</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Lịch hẹn</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Section */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Khóa học đã tham gia</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Bạn chưa tham gia khóa học nào</p>
                        </div>
                    </div>
                </div>

                {/* Events Section */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <Users className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Sự kiện đã tham gia</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Bạn chưa tham gia sự kiện nào</p>
                        </div>
                    </div>
                </div>

                {/* Appointment History Section */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Lịch sử đặt lịch</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 mb-2">Bạn chưa có lịch sử đặt lịch nào</p>
                            <Link
                                to="/appointments"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Đặt lịch hẹn ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashBoardPage;