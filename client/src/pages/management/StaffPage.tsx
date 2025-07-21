import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import StaffLayout from "../../components/StaffLayout";
import { 
    Users, 
    Calendar, 
    BarChart3, 
    TrendingUp,
    FileText
} from "lucide-react";

const StaffPage: React.FC = () => {
    const { user } = useUser();

    // Stats data cho staff
    const statsData = [
        {
            title: "Khóa học được giao",
            value: "12",
            change: "+0%",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "Sự kiện hỗ trợ",
            value: "8",
            change: "+0%",
            icon: Calendar,
            color: "bg-green-500"
        },
        {
            title: "Báo cáo đã gửi",
            value: "15",
            change: "+0%",
            icon: FileText,
            color: "bg-purple-500"
        },
        {
            title: "Tác động của bạn",
            value: "350+",
            change: "+0%", 
            icon: Users,
            color: "bg-orange-500"
        }
    ];

    return (
        <StaffLayout>
            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                    <p className="text-gray-600">Xin chào {user?.FullName || user?.Username}, hôm nay bạn muốn làm gì?</p>
            </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                        <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                            <div className="flex items-center">
                                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                                <span className="text-sm text-gray-500 ml-1">từ tháng trước</span>
                                            </div>
                                    </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to={`/roles/${user?.RoleID}/article-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Quản lý bài viết</span>
                            </div>
                        </Link>
                        <Link
                            to={`/roles/${user?.RoleID}/program-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Quản lý chương trình</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
};

export default StaffPage;