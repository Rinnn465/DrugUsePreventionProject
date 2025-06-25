import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { 
    Users, 
    BookOpen, 
    Calendar, 
    BarChart3, 
    Settings, 
    Shield,
    TrendingUp,
    Activity,
    UserCheck,
    FileText
} from "lucide-react";

const AdminPage: React.FC = () => {
    const { user } = useUser();

    const statsCards = [
        {
            title: "Tổng người dùng",
            value: "1,234",
            change: "+12%",
            icon: Users,
            color: "bg-blue-500",
            trend: "up"
        },
        {
            title: "Khóa học hoạt động",
            value: "45",
            change: "+8%",
            icon: BookOpen,
            color: "bg-green-500",
            trend: "up"
        },
        {
            title: "Sự kiện tháng này",
            value: "23",
            change: "+15%",
            icon: Calendar,
            color: "bg-purple-500",
            trend: "up"
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: "87%",
            change: "+3%",
            icon: TrendingUp,
            color: "bg-orange-500",
            trend: "up"
        }
    ];

    const managementCards = [
        {
            title: "Quản lý sự kiện",
            description: "Tạo, chỉnh sửa và theo dõi các chương trình cộng đồng",
            icon: Calendar,
            color: "bg-blue-500",
            hoverColor: "hover:bg-blue-600",
            link: `/roles/${user?.Role}/event-manage`,
            stats: "23 sự kiện"
        },
        {
            title: "Quản lý khóa học",
            description: "Quản lý nội dung học tập và theo dõi tiến độ học viên",
            icon: BookOpen,
            color: "bg-green-500",
            hoverColor: "hover:bg-green-600",
            link: `/roles/${user?.Role}/course-manage`,
            stats: "45 khóa học"
        },
        {
            title: "Quản lý nhân viên",
            description: "Quản lý tài khoản, phân quyền và theo dõi hoạt động",
            icon: UserCheck,
            color: "bg-purple-500",
            hoverColor: "hover:bg-purple-600",
            link: `/roles/${user?.Role}/employee-manage`,
            stats: "156 nhân viên"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary-100 rounded-xl">
                                <Shield className="h-8 w-8 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                                <p className="text-gray-600 mt-1">Chào mừng trở lại, {user?.Fullname || user?.Username}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                                        <div className="flex items-center">
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600 font-medium">{card.change}</span>
                                            <span className="text-sm text-gray-500 ml-1">từ tháng trước</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl ${card.color}`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Management Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {managementCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <Link key={index} to={card.link} className="group">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-primary-200 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                            {card.stats}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
                                        {card.description}
                                    </p>
                                    <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700 mt-auto">
                                        <span>Quản lý ngay</span>
                                        <Activity className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Tạo báo cáo</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <Users className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Thêm người dùng</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Lên lịch sự kiện</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <Settings className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Cài đặt hệ thống</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;