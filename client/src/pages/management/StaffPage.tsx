import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import StaffManagementTable from "../../components/management/StaffManagementTable";
import { 
    Users, 
    BookOpen, 
    Calendar, 
    BarChart3, 
    Settings,
    UserCheck,
    TrendingUp,
    Activity,
    FileText,
    Clipboard,
    MessageSquare,
    CheckCircle,
    Heart,
    Star,
    Quote
} from "lucide-react";

const StaffPage: React.FC = () => {
    const { user } = useUser();

    const statsCards = [
        {
            title: "Khóa học được giao",
            value: "12",
            change: "+5%",
            icon: BookOpen,
            color: "bg-blue-500",
            trend: "up"
        },
        {
            title: "Sự kiện hỗ trợ",
            value: "8",
            change: "+2%",
            icon: Calendar,
            color: "bg-green-500",
            trend: "up"
        },
        {
            title: "Báo cáo đã gửi",
            value: "15",
            change: "+3%",
            icon: FileText,
            color: "bg-purple-500",
            trend: "up"
        },
        {
            title: "Tác động của bạn",
            value: "350+",
            change: "học viên được hỗ trợ",
            icon: Users,
            color: "bg-orange-500",
            trend: "impact",
            subtitle: "15 ca tư vấn đã xử lý"
        }
    ];

    const managementCards = [
        {
            title: "Hỗ trợ khóa học",
            description: "Theo dõi và hỗ trợ học viên trong các khóa học được giao",
            icon: BookOpen,
            color: "bg-blue-500",
            hoverColor: "hover:bg-blue-600",
            link: `/roles/${user?.RoleID}/course-support`,
            stats: "12 khóa học"
        },
        {
            title: "Quản lý sự kiện",
            description: "Hỗ trợ tổ chức và theo dõi các chương trình cộng đồng",
            icon: Calendar,
            color: "bg-green-500",
            hoverColor: "hover:bg-green-600",
            link: `/roles/${user?.RoleID}/event-support`,
            stats: "8 sự kiện"
        },
        {
            title: "Báo cáo hoạt động",
            description: "Tạo và quản lý báo cáo hoạt động hàng ngày",
            icon: FileText,
            color: "bg-purple-500",
            hoverColor: "hover:bg-purple-600",
            link: `/roles/${user?.RoleID}/reports`,
            stats: "15 báo cáo"
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
                                <UserCheck className="h-8 w-8 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Staff</h1>
                                <p className="text-gray-600 mt-1">Chào mừng trở lại, {user?.FullName || user?.Username}</p>
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
                                        {card.trend === 'impact' ? (
                                            <div>
                                                <div className="flex items-center mb-1">
                                                    <span className="text-sm text-orange-600 font-medium">{card.change}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{(card as any).subtitle}</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">{card.change}</span>
                                                <span className="text-sm text-gray-500 ml-1">từ tháng trước</span>
                                            </div>
                                        )}
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
                                        <span>Xem chi tiết</span>
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
                                <Clipboard className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Tạo báo cáo</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <MessageSquare className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Phản hồi học viên</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <CheckCircle className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Hoàn thành nhiệm vụ</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                            <div className="text-center">
                                <BookOpen className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Trung tâm tài nguyên</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                        Nhiệm vụ hôm nay
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                <span className="text-gray-700">Kiểm tra tiến độ khóa học "Phòng chống tệ nạn xã hội"</span>
                            </div>
                            <span className="text-sm text-gray-500">09:00</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                <span className="text-gray-700">Chuẩn bị tài liệu cho sự kiện cộng đồng</span>
                            </div>
                            <span className="text-sm text-gray-500">14:00</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" defaultChecked />
                                <span className="text-gray-700 line-through">Gửi báo cáo tuần cho Manager</span>
                            </div>
                            <span className="text-sm text-green-600">Hoàn thành</span>
                        </div>
                    </div>
                </div>

                {/* Feedback & Recognition */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Phản hồi & Ghi nhận
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Positive Feedback */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                <Quote className="h-4 w-4 text-blue-500" />
                                Phản hồi từ học viên
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex items-start gap-3">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">"Bài giảng của thầy/cô rất hữu ích và dễ hiểu. Em đã hiểu rõ hơn về tác hại của ma túy."</p>
                                    <p className="text-xs text-gray-500 mt-2">- Nguyễn Văn A, Khóa học "Phòng chống tệ nạn xã hội"</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                    <div className="flex items-start gap-3">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">"Cảm ơn cô đã tư vấn và hỗ trợ em rất nhiều. Em cảm thấy tự tin hơn trong việc từ chối ma túy."</p>
                                    <p className="text-xs text-gray-500 mt-2">- Trần Thị B, Sự kiện cộng đồng tháng 11</p>
                                </div>
                            </div>
                        </div>

                        {/* Recognition from Management */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                Ghi nhận từ quản lý
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <Star className="h-4 w-4 text-yellow-600" />
                                        </div>
                                        <span className="font-medium text-gray-800">Nhân viên xuất sắc tháng</span>
                                    </div>
                                    <p className="text-sm text-gray-700">"Chúc mừng bạn đã đạt được thành tích xuất sắc trong tháng 11 với 95% tỷ lệ hài lòng từ học viên."</p>
                                    <p className="text-xs text-gray-500 mt-2">- Manager Nguyễn Văn A</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-gray-800">Được đánh giá cao</span>
                                    </div>
                                    <p className="text-sm text-gray-700">"Cách tiếp cận tận tâm và chuyên nghiệp của bạn đã tạo ra tác động tích cực đến cộng đồng."</p>
                                    <p className="text-xs text-gray-500 mt-2">- Manager Trần Thị B</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Management Table */}
                <div className="mt-8">
                    <StaffManagementTable />
                </div>
            </div>
        </div>
    );
};

export default StaffPage