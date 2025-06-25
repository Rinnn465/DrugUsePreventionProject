import { Link, Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { 
    Users, 
    BookOpen, 
    Calendar, 
    BarChart3, 
    Settings, 
    UserCog,
    TrendingUp,
    Activity,
    UserCheck,
    FileText,
    Clock,
    AlertTriangle,
    MapPin,
    Handshake,
    Library,
    Target,
    Phone,
    Eye,
    Award,
    School,
    Building,
    Megaphone,
    CheckCircle2,
    ArrowUp,
    ArrowDown
} from "lucide-react";

const ManagerPage: React.FC = () => {
    const { user } = useUser();

    // Loading state - chờ user context load
    if (user === null) {
        // Kiểm tra localStorage trực tiếp để debug
        const storedUser = localStorage.getItem('user');
        console.log('ManagerPage - User is null, checking localStorage:', storedUser);
        
        if (storedUser) {
            // Cho phép một chút thời gian để UserContext load
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                </div>
            );
        }
    }

    // Kiểm tra quyền truy cập - chỉ Manager mới được vào
    if (!user || user.RoleName !== 'Manager') {
        console.log('Manager access denied. User:', user, 'RoleName:', user?.RoleName);
        console.log('Full user object:', JSON.stringify(user, null, 2));
        return <Navigate to="/login" replace />;
    }

    // Impact Metrics - Chỉ số đo lường tác động
    const impactMetrics = [
        {
            title: "Người được tiếp cận",
            value: "1,520",
            subtitle: "học sinh tháng này",
            change: "+18%",
            trend: "up",
            icon: Target,
            color: "bg-blue-500",
            details: "Trực tiếp: 980 | Trực tuyến: 540"
        },
        {
            title: "Thay đổi nhận thức",
            value: "+25%",
            subtitle: "tỷ lệ nhận thức đúng",
            change: "Khảo sát tại 5 trường",
            trend: "up",
            icon: TrendingUp,
            color: "bg-green-500",
            details: "Mục tiêu tháng: 95% hoàn thành"
        },
        {
            title: "Tư vấn & Hỗ trợ",
            value: "85",
            subtitle: "ca thành công",
            change: "+12 ca",
            trend: "up",
            icon: Phone,
            color: "bg-purple-500",
            details: "Hotline: 45 | Trực tiếp: 40"
        },
        {
            title: "Tài liệu phân phát",
            value: "2,340",
            subtitle: "tài liệu/video",
            change: "+320",
            trend: "up",
            icon: FileText,
            color: "bg-orange-500",
            details: "Video: 15K views | Tờ rơi: 2K phát"
        }
    ];

    // Specialized Management Cards
    const managementCards = [
        {
            title: "Quản lý dự án chuyên biệt",
            description: "Theo dõi và điều phối các chiến dịch phòng chống tệ nạn xã hội",
            icon: BarChart3,
            color: "bg-blue-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/project-manage`,
            priority: "high",
            details: [
                { label: "Chiến dịch trường học", count: "5", icon: School },
                { label: "Hội thảo cộng đồng", count: "4", icon: Users },
                { label: "Nội dung số", count: "3", icon: Megaphone }
            ]
        },
        {
            title: "Bản đồ địa bàn hoạt động",
            description: "Theo dõi các điểm nóng và khu vực triển khai dự án",
            icon: MapPin,
            color: "bg-green-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/area-map`,
            priority: "high",
            details: [
                { label: "Điểm nóng đang theo dõi", count: "12", icon: AlertTriangle },
                { label: "Trường học đối tác", count: "8", icon: School },
                { label: "Sự kiện sắp tới", count: "6", icon: Calendar }
            ]
        },
        {
            title: "Quản lý đối tác",
            description: "Duy trì và phát triển mạng lưới đối tác chiến lược",
            icon: Handshake,
            color: "bg-indigo-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/partner-manage`,
            priority: "medium",
            details: [
                { label: "Đối tác mới (Q4)", count: "5", icon: CheckCircle2 },
                { label: "Cần liên hệ lại", count: "3", icon: Clock },
                { label: "Hợp tác tích cực", count: "15", icon: Award }
            ]
        },
        {
            title: "Thư viện tài nguyên",
            description: "Quản lý nội dung truyền thông và tài liệu giáo dục",
            icon: Library,
            color: "bg-purple-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/resource-library`,
            priority: "medium",
            details: [
                { label: "Video mới xuất bản", count: "5", icon: Eye },
                { label: "Infographic", count: "12", icon: FileText },
                { label: "Tài liệu hướng dẫn", count: "8", icon: BookOpen }
            ]
        },
        {
            title: "Đội ngũ chuyên môn",
            description: "Quản lý đội ngũ và phát triển năng lực chuyên môn",
            icon: UserCheck,
            color: "bg-teal-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/team-manage`,
            priority: "high",
            details: [
                { label: "Chuyên gia tư vấn", count: "10", icon: Users },
                { label: "Điều phối viên dự án", count: "8", icon: Settings },
                { label: "Nhân viên truyền thông", count: "6", icon: Megaphone }
            ]
        },
        {
            title: "Báo cáo tác động",
            description: "Phân tích hiệu quả và tác động của các hoạt động",
            icon: BarChart3,
            color: "bg-rose-500",
            link: `/roles/${user?.RoleName?.toLowerCase()}/impact-reports`,
            priority: "medium",
            details: [
                { label: "Báo cáo tháng", count: "4", icon: FileText },
                { label: "Khảo sát hoàn thành", count: "7", icon: CheckCircle2 },
                { label: "Phân tích pending", count: "2", icon: Clock }
            ]
        }
    ];

    // Enhanced Urgent Tasks with categories
    const urgentTasks = [
        { 
            task: "Phê duyệt ngân sách chiến dịch Q1/2024", 
            deadline: "2 ngày", 
            priority: "high", 
            category: "Phê duyệt",
            link: "/budget-approval/q1-2024"
        },
        { 
            task: "Review kết quả khảo sát trường THPT Nguyễn Du", 
            deadline: "1 tuần", 
            priority: "medium", 
            category: "Review",
            link: "/survey-results/nguyen-du-school"
        },
        { 
            task: "Họp điều phối với Sở GD&ĐT", 
            deadline: "3 ngày", 
            priority: "high", 
            category: "Họp",
            link: "/meetings/gd-dt-coordination"
        },
        { 
            task: "Duyệt nội dung video tuyên truyền mới", 
            deadline: "5 ngày", 
            priority: "medium", 
            category: "Phê duyệt",
            link: "/content-approval/video-campaign"
        }
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Phê duyệt": return "bg-red-50 text-red-700 border-red-200";
            case "Review": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Họp": return "bg-green-50 text-green-700 border-green-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <UserCog className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
                                <p className="text-gray-600 mt-1">Phòng chống tệ nạn xã hội - {user?.FullName || user?.Username}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <div className="flex items-center text-green-800">
                                    <Target className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Mục tiêu tháng: 95%</span>
                                </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                <div className="flex items-center text-yellow-800">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">{urgentTasks.length} việc cần xử lý</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Impact Metrics - Chỉ số đo lường tác động */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-indigo-600" />
                        Chỉ số đo lường tác động (Tháng này)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {impactMetrics.map((metric, index) => {
                            const IconComponent = metric.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${metric.color}`}>
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex items-center text-green-600">
                                            {metric.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                                        <p className="text-sm text-gray-500 mb-2">{metric.subtitle}</p>
                                        <div className="text-xs text-green-600 font-medium mb-2">{metric.change}</div>
                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{metric.details}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Specialized Management Cards */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý chuyên môn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {managementCards.map((card, index) => {
                                const IconComponent = card.icon;
                                return (
                                    <Link key={index} to={card.link} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-indigo-200 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                                                    <IconComponent className="h-6 w-6 text-white" />
                                                </div>
                                                {card.priority === 'high' && (
                                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                        Ưu tiên cao
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                                {card.description}
                                            </p>
                                            
                                            {/* Details breakdown */}
                                            <div className="space-y-2 mb-4 flex-grow">
                                                {card.details.map((detail, idx) => {
                                                    const DetailIcon = detail.icon;
                                                    return (
                                                        <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                                            <div className="flex items-center">
                                                                <DetailIcon className="h-3 w-3 mr-2 text-gray-500" />
                                                                <span className="text-gray-700">{detail.label}</span>
                                                            </div>
                                                            <span className="font-semibold text-gray-900">{detail.count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 mt-auto">
                                                <span>Quản lý ngay</span>
                                                <Activity className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Enhanced Urgent Tasks */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                                Việc cần xử lý gấp
                            </h3>
                            <div className="space-y-3">
                                {urgentTasks.map((task, index) => (
                                    <Link key={index} to={task.link} className="block hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-start space-x-3 p-3">
                                            <div className={`p-2 rounded-full ${task.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                                <Clock className={`h-4 w-4 ${task.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center mb-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(task.category)} mr-2`}>
                                                        {task.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 mb-1">{task.task}</p>
                                                <p className="text-xs text-gray-500">Còn {task.deadline}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link to="/tasks/all" className="block w-full mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors text-center">
                                Xem tất cả công việc →
                            </Link>
                        </div>

                        {/* Enhanced Team Performance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Award className="h-5 w-5 mr-2 text-green-600" />
                                Hiệu suất tổng thể
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Hoàn thành mục tiêu tháng</span>
                                    <span className="text-sm font-semibold text-green-600">95%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-green-500 h-3 rounded-full relative" style={{ width: '95%' }}>
                                        <div className="absolute right-0 top-0 h-3 w-1 bg-green-600 rounded-r-full"></div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-600">1,520</div>
                                        <div className="text-xs text-blue-700">Người tiếp cận</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-600">85</div>
                                        <div className="text-xs text-green-700">Ca tư vấn</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New: Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                                Tổng quan nhanh
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Điểm nóng đang theo dõi</span>
                                    <span className="font-semibold">12 khu vực</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đối tác tích cực</span>
                                    <span className="font-semibold">15 tổ chức</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nội dung mới (tuần)</span>
                                    <span className="font-semibold">8 tài liệu</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tình nguyện viên</span>
                                    <span className="font-semibold">45 người</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerPage;