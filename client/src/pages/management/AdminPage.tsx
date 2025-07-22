import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import AdminLayout from "../../components/AdminLayout";
import {
    Users,
    BookOpen,
    Calendar,
    BarChart3,
    TrendingUp,
    FileText
} from "lucide-react";

const AdminPage: React.FC = () => {
    const { user } = useUser();
    const [statsData, setStatsData] = useState([
        {
            title: "Tổng người dùng",
            value: "-",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "Tổng lượt đăng ký khóa học",
            value: "-",
            icon: BookOpen,
            color: "bg-green-500"
        },
        {
            title: "Tổng lượt tham gia chương trình",
            value: "-",
            icon: Calendar,
            color: "bg-purple-500"
        },
        {
            title: "Tỷ lệ hoàn thành khóa học",
            value: "-",
            change: "",
            icon: TrendingUp,
            color: "bg-orange-500"
        }
    ]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = localStorage.getItem("token");
                const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
                const [userRes, courseEnrollRes, programEnrollRes, courseCompletionRes] = await Promise.all([
                    fetch("http://localhost:5000/api/account/statistics/total", { headers }),
                    fetch("http://localhost:5000/api/course/statistics/total-enrollment", { headers }),
                    fetch("http://localhost:5000/api/program-attendee/statistics/total-attendee", { headers }),
                    fetch("http://localhost:5000/api/course/statistics/total-completion-rate", { headers })
                ]);
                const userData = await userRes.json();
                const courseEnrollData = await courseEnrollRes.json();
                const programEnrollData = await programEnrollRes.json();
                const courseCompletionData = await courseCompletionRes.json();

                setStatsData([
                    {
                        title: "Tổng người dùng",
                        value: userData.data.total || "-",
                        icon: Users,
                        color: "bg-blue-500"
                    },
                    {
                        title: "Tổng lượt đăng ký khóa học",
                        value: courseEnrollData.totalEnrollment || "-",
                        icon: BookOpen,
                        color: "bg-green-500"
                    },
                    {
                        title: "Tổng lượt tham gia chương trình",
                        value: programEnrollData.data.totalAttendee || "-",
                        icon: Calendar,
                        color: "bg-purple-500"
                    },
                    {
                        title: "Tỷ lệ hoàn thành khóa học",
                        value: courseCompletionData.data.completePercentage + "%",
                        icon: TrendingUp,
                        color: "bg-orange-500"
                    }
                ]);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <AdminLayout>
            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                    <p className="text-gray-600">Xin chào {user?.FullName || user?.Username || 'Quản trị viên'}, hôm nay bạn muốn làm gì?</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat) => (
                        <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-1 min-h-[40px]">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to={`/roles/${user?.RoleID}/program-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Thêm chương trình</span>
                            </div>
                        </Link>
                        <Link
                            to={`/roles/${user?.RoleID}/course-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <BookOpen className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Thêm khóa học</span>
                            </div>
                        </Link>
                        <Link
                            to={`/roles/${user?.RoleID}/article-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Quản lý bài viết</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPage;