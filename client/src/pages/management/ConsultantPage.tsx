import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useState } from "react";
import { 
    Calendar, 
    MessageCircle, 
    BarChart3, 
    Users, 
    TrendingUp,
    Activity,
    UserCheck,
    FileText,
    Stethoscope,
    AlertTriangle,
    Clock,
    Star,
    Search,
    Edit3,
    X,
    Eye,
    Target,
    User
} from "lucide-react";

const ConsultantPage: React.FC = () => {
    const { user } = useUser();
    
    // State management for modals and popups
    const [showSuccessRateModal, setShowSuccessRateModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [showQuickNote, setShowQuickNote] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [quickNoteText, setQuickNoteText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const statsCards = [
        {
            title: "Cuộc hẹn tháng này",
            value: "32",
            change: "+18%",
            icon: Calendar,
            color: "bg-blue-500",
            trend: "up"
        },
        {
            title: "Khách hàng đang tư vấn",
            value: "15",
            change: "+12%",
            icon: Users,
            color: "bg-green-500",
            trend: "up"
        },
        {
            title: "Phiên tư vấn hoàn thành",
            value: "128",
            change: "+25%",
            icon: MessageCircle,
            color: "bg-purple-500",
            trend: "up"
        },
        {
            title: "Tỷ lệ thành công",
            value: "94%",
            change: "+5%",
            icon: TrendingUp,
            color: "bg-orange-500",
            trend: "up"
        }
    ];

    const managementCards = [
        {
            title: "Quản lý lịch hẹn",
            description: "Xem và quản lý các cuộc hẹn tư vấn, đặt lịch mới và theo dõi tiến độ",
            icon: Calendar,
            color: "bg-blue-500",
            link: "/appointments",
            stats: "8 lịch hẹn hôm nay"
        },
        {
            title: "Hồ sơ khách hàng",
            description: "Theo dõi tiến trình tư vấn và lịch sử điều trị của khách hàng",
            icon: UserCheck,
            color: "bg-green-500",
            link: "/consultant/clients",
            stats: "24 khách hàng đang theo dõi"
        },
        {
            title: "Báo cáo tư vấn",
            description: "Tạo và quản lý báo cáo tiến trình tư vấn cho từng khách hàng",
            icon: FileText,
            color: "bg-purple-500",
            link: "/consultant/reports",
            stats: "12 báo cáo tuần này"
        }
    ];

    const todaySchedule = [
        {
            time: "09:00",
            client: "Nguyễn Văn A",
            type: "Tư vấn cá nhân",
            status: "upcoming",
            riskLevel: "high",
            note: "Đã bỏ lỡ hẹn tuần trước, cần quan tâm đặc biệt",
            lastSession: "15/12/2024",
            currentGoal: "Giảm thiểu cảm giác khao khát"
        },
        {
            time: "10:30",
            client: "Trần Thị B",
            type: "Theo dõi định kỳ",
            status: "upcoming",
            riskLevel: "normal",
            note: "Tiến triển ổn định",
            lastSession: "18/12/2024",
            currentGoal: "Duy trì động lực tích cực"
        },
        {
            time: "14:00",
            client: "Lê Văn C",
            type: "Tư vấn gia đình",
            status: "completed",
            riskLevel: "good",
            note: "Đang có tiến triển rất tốt",
            lastSession: "20/12/2024",
            currentGoal: "Tái hòa nhập xã hội"
        },
        {
            time: "15:30",
            client: "Phạm Thị D",
            type: "Tư vấn nhóm",
            status: "upcoming",
            riskLevel: "normal",
            note: "Tham gia tích cực trong nhóm",
            lastSession: "17/12/2024",
            currentGoal: "Xây dựng mạng lưới hỗ trợ"
        }
    ];

    // Success rate data
    const successRateData = [
        { label: "Khách hàng đạt mục tiêu đề ra", value: 80, color: "bg-blue-500" },
        { label: "Khách hàng có phản hồi tích cực", value: 95, color: "bg-green-500" },
        { label: "Khách hàng hoàn thành liệu trình", value: 75, color: "bg-purple-500" },
        { label: "Khách hàng không tái nghiện sau 6 tháng", value: 88, color: "bg-orange-500" }
    ];

    // Sample client data for search
    const clientsData = [
        "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", 
        "Hoàng Minh E", "Vũ Thị F", "Đỗ Văn G", "Bùi Thị H"
    ];

    const filteredClients = clientsData.filter(client =>
        client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case "high":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case "normal":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "good":
                return <Star className="h-4 w-4 text-green-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary-100 rounded-xl">
                                <Stethoscope className="h-8 w-8 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Tư vấn viên</h1>
                                <p className="text-gray-600 mt-1">Chào mừng trở lại, {user?.FullName || user?.Username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Hôm nay</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('vi-VN')}</p>
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
                    const isSuccessRate = card.title === "Tỷ lệ thành công";
                    return (
                        <div 
                            key={index} 
                            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${isSuccessRate ? 'cursor-pointer hover:border-primary-300' : ''}`}
                            onClick={isSuccessRate ? () => setShowSuccessRateModal(true) : undefined}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {card.title}
                                        {isSuccessRate && (
                                            <Eye className="inline h-4 w-4 ml-1 text-gray-400" />
                                        )}
                                    </p>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Management Cards */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý tư vấn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {managementCards.map((card, index) => {
                                const IconComponent = card.icon;
                                return (
                                    <Link key={index} to={card.link} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-primary-200 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                                                    <IconComponent className="h-6 w-6 text-white" />
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                                    {card.stats}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
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
                                        <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Đặt lịch hẹn mới</span>
                                    </div>
                                </button>
                                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                                    <div className="text-center">
                                        <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Tạo báo cáo</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setShowSearchModal(true)}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <div className="text-center">
                                        <Search className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Tìm kiếm hồ sơ</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setShowQuickNote(true)}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <div className="text-center">
                                        <Edit3 className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Ghi chú nhanh</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lịch hôm nay</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="space-y-4">
                                {todaySchedule.map((appointment, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${
                                            appointment.status === 'completed' 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                        }`}
                                        onClick={() => appointment.status === 'upcoming' ? setSelectedAppointment(appointment) : null}
                                    >
                                        <div className="flex-shrink-0">
                                            <div className={`w-3 h-3 rounded-full ${
                                                appointment.status === 'completed' 
                                                    ? 'bg-green-500' 
                                                    : 'bg-blue-500'
                                            }`}></div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {appointment.time}
                                                    </span>
                                                    <div 
                                                        className="group relative"
                                                        title={appointment.note}
                                                    >
                                                        {getRiskIcon(appointment.riskLevel)}
                                                        <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                            {appointment.note}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    appointment.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {appointment.status === 'completed' ? 'Hoàn thành' : 'Sắp tới'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">{appointment.client}</p>
                                                    <p className="text-xs text-gray-500">{appointment.type}</p>
                                                </div>
                                                {appointment.status === 'upcoming' && (
                                                    <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <Link 
                                    to="/appointments" 
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
                                >
                                    Xem tất cả lịch hẹn
                                    <Activity className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Rate Modal */}
            {showSuccessRateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Chi tiết Tỷ lệ thành công</h3>
                            <button 
                                onClick={() => setShowSuccessRateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {successRateData.map((item, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        <span className="text-lg font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${item.color}`}
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Tỷ lệ tổng hợp:</strong> Được tính dựa trên trung bình có trọng số của các chỉ số trên, 
                                trong đó "Không tái nghiện sau 6 tháng" chiếm 40%, "Đạt mục tiêu đề ra" chiếm 30%, 
                                "Hoàn thành liệu trình" chiếm 20%, và "Phản hồi tích cực" chiếm 10%.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Thông tin cuộc hẹn</h3>
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{selectedAppointment.client}</p>
                                    <p className="text-sm text-gray-500">{selectedAppointment.time} - {selectedAppointment.type}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Phiên trước
                                </h4>
                                <p className="text-sm text-gray-600">{selectedAppointment.lastSession}</p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Mục tiêu hiện tại
                                </h4>
                                <p className="text-sm text-gray-600">{selectedAppointment.currentGoal}</p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    {getRiskIcon(selectedAppointment.riskLevel)}
                                    Ghi chú quan trọng
                                </h4>
                                <p className="text-sm text-gray-600">{selectedAppointment.note}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex gap-3">
                            <Link 
                                to={`/consultant/clients/${selectedAppointment.client}`}
                                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center text-sm font-medium"
                                onClick={() => setSelectedAppointment(null)}
                            >
                                Xem hồ sơ đầy đủ
                            </Link>
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Tìm kiếm hồ sơ</h3>
                            <button 
                                onClick={() => {
                                    setShowSearchModal(false);
                                    setSearchQuery("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Nhập tên khách hàng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filteredClients.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredClients.map((client, index) => (
                                        <Link
                                            key={index}
                                            to={`/consultant/clients/${client}`}
                                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                                            onClick={() => {
                                                setShowSearchModal(false);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-gray-400" />
                                                <span className="text-gray-900">{client}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Không tìm thấy khách hàng nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Note Modal */}
            {showQuickNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Ghi chú nhanh</h3>
                            <button 
                                onClick={() => {
                                    setShowQuickNote(false);
                                    setQuickNoteText("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <textarea
                                placeholder="Nhập ghi chú của bạn..."
                                value={quickNoteText}
                                onChange={(e) => setQuickNoteText(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                rows={4}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    // Here you would save the note
                                    console.log("Saving note:", quickNoteText);
                                    setShowQuickNote(false);
                                    setQuickNoteText("");
                                }}
                                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                disabled={!quickNoteText.trim()}
                            >
                                Lưu ghi chú
                            </button>
                            <button 
                                onClick={() => {
                                    setShowQuickNote(false);
                                    setQuickNoteText("");
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultantPage; 