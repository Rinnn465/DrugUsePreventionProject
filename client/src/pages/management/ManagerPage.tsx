import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import AdminLayout from "../../components/AdminLayout";
import { 
    BookOpen, 
    Calendar, 
    BarChart3,
    FileText,
    Target
} from "lucide-react";

const ManagerPage: React.FC = () => {
    const { user } = useUser();



    return (
        <AdminLayout>
            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                    <p className="text-gray-600">Xin chào {user?.FullName || user?.Username || 'Manager'}, hôm nay bạn muốn làm gì?</p>
                </div>



                {/* Quick Actions for Manager */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to={`/roles/${user?.RoleID}/project-manage`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <Target className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Quản lý dự án</span>
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
                        <Link
                            to={`/roles/${user?.RoleID}/reports`}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Báo cáo & Phân tích</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManagerPage;