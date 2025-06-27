import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    Calendar, 
    Settings,
    BarChart3,
    Users,
    BookOpen
} from 'lucide-react';

const ProgramDashboardPage: React.FC = () => {
    const { userId } = useParams();
    
    // Chỉ giữ lại thẻ "Quản lý chương trình"
    const managementOption = {
        title: "Quản lý chương trình",
        description: "Tạo, chỉnh sửa và xóa các chương trình cộng đồng. Quản lý toàn bộ vòng đời của chương trình từ lúc tạo đến khi kết thúc, bao gồm việc theo dõi tiến độ, quản lý người tham gia, và đánh giá hiệu quả.",
        icon: Calendar,
        color: "bg-blue-500",
        link: `/roles/${userId}/program-manage`,
        action: "Quản lý toàn bộ"
    };

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

                {/* Single Management Option - Full Width */}
                <div className="mb-8">
                    <Link to={managementOption.link} className="group block">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group-hover:border-blue-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-4 rounded-2xl ${managementOption.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                        <Calendar className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {managementOption.title}
                                        </h2>
                                        <div className="flex items-center text-blue-600 font-semibold text-lg group-hover:text-blue-700">
                                            <span>{managementOption.action}</span>
                                            <Settings className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center space-x-8 text-gray-500">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">23</div>
                                        <div className="text-sm">Chương trình</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">8</div>
                                        <div className="text-sm">Đang diễn ra</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">1,234</div>
                                        <div className="text-sm">Người tham gia</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-6 group-hover:bg-blue-50 transition-colors">
                                <p className="text-gray-700 text-lg leading-relaxed group-hover:text-gray-800">
                                    {managementOption.description}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Tạo & chỉnh sửa chương trình</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">Theo dõi tiến độ thực hiện</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-600">Đánh giá hiệu quả chương trình</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProgramDashboardPage;
