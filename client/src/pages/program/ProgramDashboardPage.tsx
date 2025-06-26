import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    Plus, 
    Calendar, 
    Settings,
    BarChart3,
    Users,
    BookOpen
} from 'lucide-react';

const ProgramDashboardPage: React.FC = () => {
    const { userId } = useParams();
    
    const managementOptions = [
        {
            title: "Quản lý chương trình",
            description: "Tạo, chỉnh sửa và xóa các chương trình cộng đồng",
            icon: Calendar,
            color: "bg-blue-500",
            link: `/roles/${userId}/program-manage`,
            action: "Quản lý toàn bộ"
        },
        {
            title: "Tạo chương trình mới",
            description: "Thêm chương trình phòng chống tệ nạn xã hội",
            icon: Plus,
            color: "bg-green-500",
            link: `/roles/${userId}/program-manage`,
            action: "Tạo mới"
        },
        {
            title: "Thống kê chương trình",
            description: "Xem báo cáo và phân tích hiệu quả",
            icon: BarChart3,
            color: "bg-purple-500",
            link: `/roles/${userId}/program-manage`,
            action: "Xem thống kê"
        },
        {
            title: "Quản lý người tham gia",
            description: "Theo dõi và quản lý người đăng ký tham gia",
            icon: Users,
            color: "bg-orange-500",
            link: `/roles/${userId}/program-manage`,
            action: "Quản lý"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tổng quan Chương trình Cộng đồng</h1>
                                <p className="text-gray-600 mt-1">Dashboard quản lý các chương trình phòng chống tệ nạn xã hội</p>
                            </div>
                        </div>
                        <Link
                            to="/roles/Admin/program-manage"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Settings className="h-5 w-5" />
                            <span>Vào trang quản lý</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng chương trình</p>
                                <p className="text-2xl font-bold text-gray-900">23</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang diễn ra</p>
                                <p className="text-2xl font-bold text-gray-900">8</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Người tham gia</p>
                                <p className="text-2xl font-bold text-gray-900">1,234</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hiệu quả</p>
                                <p className="text-2xl font-bold text-gray-900">87%</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {managementOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <Link key={option.title} to={option.link} className="group">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-200 h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${option.color} group-hover:scale-110 transition-transform`}>
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                        {option.description}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
                                        <span>{option.action}</span>
                                        <Settings className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProgramDashboardPage;
