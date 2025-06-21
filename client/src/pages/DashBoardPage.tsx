import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { courseData } from "../data/courseData";
import { User, BookOpen, Calendar, Clock, Users, Phone, Mail, MapPin, Edit, ArrowRight } from "lucide-react";
import { Appointment } from "../types/Appointment";

const DashBoardPage: React.FC = () => {
    const { userId } = useParams();
    const { user, setUser } = useUser();
    const location = useLocation();

    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Check current page type
    const isProfilePage = location.pathname.includes('/profile');
    const isCoursesPage = location.pathname.includes('/courses');
    const isEventsPage = location.pathname.includes('/events');
    const isAppointmentsPage = location.pathname.includes('/appointments');

    useEffect(() => {
        fetch(`http://localhost:5000/api/appointment`)
            .then(res => res.json())
            .then(data => setAppointments(data.data))
            .catch(err => console.error("Error fetching appointments:", err));
    }, [userId])

    // Profile Page
    if (isProfilePage) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Profile Content */}
                <main className="flex-grow p-6 lg:p-8">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                <Edit className="h-4 w-4" />
                                <span>Chỉnh sửa</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <User className="h-16 w-16 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">{user?.Username}</h2>
                                <p className="text-gray-600 text-sm">Thành viên từ {parseDate(`${user?.CreatedAt}`)}</p>
                            </div>

                            {/* Basic Info */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-800">{user?.Email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Số điện thoại</p>
                                            <p className="font-medium text-gray-800">Chưa cập nhật</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Địa chỉ</p>
                                            <p className="font-medium text-gray-800">Chưa cập nhật</p>
                                        </div>
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
                                    <p className="text-gray-600 text-sm font-medium">Khóa học hoàn thành</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
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
                                    <p className="text-gray-600 text-sm font-medium">Cuộc hẹn</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Hoạt động gần đây</h2>
                        </div>

                        <div className="p-6">
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Chưa có hoạt động nào</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Courses Page
    if (isCoursesPage) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-grow p-6 lg:p-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Khóa học đã tham gia</h1>
                                    <p className="text-gray-600">Quản lý các khóa học bạn đã đăng ký</p>
                                </div>
                            </div>
                            <Link
                                to="/courses"
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <span>Khám phá thêm</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">0</p>
                                <p className="text-sm text-gray-600">Đang học</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">0</p>
                                <p className="text-sm text-gray-600">Hoàn thành</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">0</p>
                                <p className="text-sm text-gray-600">Tạm dừng</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-600">0</p>
                                <p className="text-sm text-gray-600">Tổng cộng</p>
                            </div>
                        </div>
                    </div>

                    {/* Courses List */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Danh sách khóa học</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có khóa học nào</h3>
                                <p className="text-gray-600 mb-4">Bạn chưa tham gia khóa học nào. Hãy khám phá và đăng ký ngay!</p>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Khám phá khóa học
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Events Page
    if (isEventsPage) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-grow p-6 lg:p-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Users className="h-8 w-8 text-green-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Sự kiện đã tham gia</h1>
                                    <p className="text-gray-600">Quản lý các sự kiện bạn đã tham gia</p>
                                </div>
                            </div>
                            <Link
                                to="/community-programs"
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                <span>Khám phá thêm</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Event Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">0</p>
                                <p className="text-sm text-gray-600">Sắp tới</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">0</p>
                                <p className="text-sm text-gray-600">Đã tham gia</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">0</p>
                                <p className="text-sm text-gray-600">Đã hủy</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-600">0</p>
                                <p className="text-sm text-gray-600">Tổng cộng</p>
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Danh sách sự kiện</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có sự kiện nào</h3>
                                <p className="text-gray-600 mb-4">Bạn chưa tham gia sự kiện nào. Hãy khám phá và đăng ký ngay!</p>
                                <Link
                                    to="/community-programs"
                                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    <Users className="h-5 w-5 mr-2" />
                                    Khám phá sự kiện
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Appointments Page
    if (isAppointmentsPage) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-grow p-6 lg:p-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-8 w-8 text-purple-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn của tôi</h1>
                                    <p className="text-gray-600">Quản lý các cuộc hẹn tư vấn của bạn</p>
                                </div>
                            </div>
                            <Link
                                to="/appointments"
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                <span>Đặt lịch mới</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Appointment Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">{appointments.length}</p>
                                <p className="text-sm text-gray-600">Tổng cộng</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">0</p>
                                <p className="text-sm text-gray-600">Sắp tới</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">0</p>
                                <p className="text-sm text-gray-600">Hoàn thành</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-600">0</p>
                                <p className="text-sm text-gray-600">Đã hủy</p>
                            </div>
                        </div>
                    </div>

                    {/* Appointments List */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Lịch sử cuộc hẹn</h2>
                        </div>
                        <div className="p-6">
                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((appointment) => (
                                        <div key={appointment.AppointmentID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                            <div>
                                                <p className="font-medium text-gray-800">Cuộc hẹn #{appointment.AppointmentID}</p>
                                                <p className="text-sm text-gray-600">Ngày: {parseDate(appointment.Date)}</p>
                                            </div>
                                            <Link
                                                to={`/appointments/${appointment.AppointmentID}`}
                                                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                            >
                                                Chi tiết
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có lịch hẹn nào</h3>
                                    <p className="text-gray-600 mb-4">Bạn chưa có lịch hẹn tư vấn nào. Hãy đặt lịch ngay!</p>
                                    <Link
                                        to="/appointments"
                                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                    >
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Đặt lịch hẹn ngay
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Main Dashboard Page
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
                    <Link to={`/dashboard/${userId}/courses`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Khóa học tham gia</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{courseData.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Link>

                    <Link to={`/dashboard/${userId}/events`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Sự kiện tham gia</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Link>

                    <Link to={`/dashboard/${userId}/appointments`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Lịch hẹn</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Overview Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Courses */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-800">Khóa học gần đây</h2>
                                </div>
                                <Link 
                                    to={`/dashboard/${userId}/courses`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-2">Chưa có khóa học nào</p>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Khám phá khóa học
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Events */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-6 w-6 text-green-600" />
                                    <h2 className="text-xl font-semibold text-gray-800">Sự kiện gần đây</h2>
                                </div>
                                <Link 
                                    to={`/dashboard/${userId}/events`}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-2">Chưa có sự kiện nào</p>
                                <Link
                                    to="/community-programs"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Khám phá sự kiện
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default DashBoardPage;