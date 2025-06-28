import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';
import * as apiUtils from '../../utils/apiUtils';
import {
    Calendar,
    MessageCircle,
    BarChart3,
    TrendingUp,
    Activity,
    Stethoscope,
    Clock,
    Search,
    X,
    Eye,
    User,
    TrendingDown
} from "lucide-react";

// Interfaces for appointment management
interface PendingAppointment {
    AppointmentID: number;
    ConsultantID: number;
    AccountID: number;
    Time: string;
    Date: string;
    MeetingURL?: string;
    Status: string;
    Description?: string;
    Duration: number;
    CustomerName?: string;
    CustomerEmail?: string;
}



const ConsultantPage: React.FC = () => {
    const { user } = useUser();

    // State management for modals and popups
    const [showSuccessRateModal, setShowSuccessRateModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<PendingAppointment | null>(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Appointment management state
    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<PendingAppointment[]>([]);
    const [isLoadingTodayAppointments, setIsLoadingTodayAppointments] = useState(false);

    // Rejection modal state
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [appointmentToReject, setAppointmentToReject] = useState<number | null>(null);
    const [compareMonthAppointments, setCompareMonthAppointments] = useState({
        lastMonth: 0,
        thisMonth: 0
    });


    const statsCards = [
        {
            title: "Cuộc hẹn tháng này",
            value: compareMonthAppointments.thisMonth,
            change: (compareMonthAppointments.thisMonth / compareMonthAppointments.lastMonth) * 100 + "%",
            icon: Calendar,
            color: "bg-blue-500",
            trend: compareMonthAppointments.thisMonth > compareMonthAppointments.lastMonth ? "increase" : "decrease"
        },
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


    const fetchCompareMonthAppointments = useCallback(async () => {
        try {
            const response = await apiUtils.consultants.compareMonthAppointments(user?.AccountID || 0);

            setCompareMonthAppointments({
                lastMonth: response.lastMonthAppointments,
                thisMonth: response.thisMonthAppointments
            });

        } catch (error) {
            console.error('Error fetching compare month appointments:', error);
        }


    }, [user?.AccountID]);

    const fetchPendingAppointments = useCallback(async () => {
        if (!user?.AccountID) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/consultant/pending-appointments/${user.AccountID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPendingAppointments(data.data || []);
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
            toast.error('Không thể tải danh sách cuộc hẹn chờ duyệt');
            setPendingAppointments([]);
        }
    }, [user?.AccountID]);


    const fetchTodayAppointments = useCallback(async () => {
        if (!user?.AccountID) return;

        setIsLoadingTodayAppointments(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/consultant/today-appointments/${user.AccountID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTodayAppointments(data.data || []);
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            toast.error('Không thể tải danh sách cuộc hẹn hôm nay');
            setTodayAppointments([]);
        } finally {
            setIsLoadingTodayAppointments(false);
        }
    }, [user?.AccountID]);



    // Handle appointment approval
    const handleApproveAppointment = async (appointmentId: number) => {
        try {
            await apiUtils.appointments.approve(appointmentId);
            toast.success('Đã phê duyệt cuộc hẹn!');
            fetchPendingAppointments();
        } catch (error) {
            console.error('Error approving appointment:', error);
            toast.error('Có lỗi xảy ra khi phê duyệt cuộc hẹn');
        }
    };

    // Handle appointment rejection
    const handleRejectAppointment = async (appointmentId: number) => {
        setAppointmentToReject(appointmentId);
        setIsRejectionModalOpen(true);
    };

    // Confirm rejection with reason
    const confirmRejectAppointment = async () => {
        if (!appointmentToReject || !rejectionReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await apiUtils.appointments.reject(appointmentToReject, rejectionReason.trim());
            toast.success('Đã từ chối cuộc hẹn!');
            fetchPendingAppointments();
            setIsRejectionModalOpen(false);
            setRejectionReason('');
            setAppointmentToReject(null);
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            toast.error('Có lỗi xảy ra khi từ chối cuộc hẹn');
        }
    };

    // Cancel rejection
    const cancelRejection = () => {
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        setAppointmentToReject(null);
    };

    // Helper functions
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateString);
            return 'Invalid Date';
        }
        return date.toLocaleDateString('vi-VN');
    };



    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.includes('T')) {
            const timePart = timeString.split('T')[1];
            return timePart.substring(0, 5);
        }
        return timeString.substring(0, 5);
    };

    // Load data on component mount
    useEffect(() => {
        if (user?.AccountID) {
            fetchPendingAppointments();
            fetchTodayAppointments();
            fetchCompareMonthAppointments();
        }
    }, [user?.AccountID, fetchPendingAppointments, fetchTodayAppointments, fetchCompareMonthAppointments]);

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
                                            {card.trend === "increase" ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-sm text-green-600 font-medium">{card.change}</span>
                                                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                    <span className="text-sm text-red-600 font-medium">{card.change}</span>
                                                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                                                </>
                                            )}
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
                    <div className="lg:col-span-2">


                        {/* Pending Appointments Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                                Yêu cầu cuộc hẹn ({pendingAppointments.length})
                            </h3>
                            {pendingAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Không có yêu cầu cuộc hẹn nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingAppointments.map((appointment) => (
                                        <div key={appointment.AppointmentID} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="bg-orange-100 rounded-full p-2">
                                                            <User className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {appointment.CustomerName || 'Khách hàng'}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(appointment.Date)} lúc {formatTime(appointment.Time)}
                                                            </p>
                                                            {appointment.Duration && (
                                                                <p className="text-sm text-gray-500">
                                                                    Thời lượng: {appointment.Duration} phút
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {appointment.Description && (
                                                        <div className="mt-3 ml-12">
                                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                                {appointment.Description}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <button
                                                        onClick={() => handleApproveAppointment(appointment.AppointmentID)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAppointment(appointment.AppointmentID)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        <Search className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Xem lịch sử cuộc hẹn</span>
                                    </div>
                                </button>
                                <button
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <div className="text-center">
                                        <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Xem lịch làm việc</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lịch hôm nay</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {isLoadingTodayAppointments ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : todayAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {todayAppointments.map((appointment) => (
                                        <div
                                            key={appointment.AppointmentID}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${appointment.Status === 'confirmed'
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                                }`}
                                            onClick={() => setSelectedAppointment(appointment)}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className={`w-3 h-3 rounded-full ${appointment.Status === 'confirmed'
                                                    ? 'bg-green-500'
                                                    : 'bg-blue-500'
                                                    }`}></div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {formatTime(appointment.Time)}
                                                        </span>
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${appointment.Status === 'confirmed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {appointment.Status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600">{appointment.CustomerName || 'Không rõ tên'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {appointment.Description || 'Tư vấn cá nhân'} • {appointment.Duration || 60} phút
                                                        </p>
                                                    </div>
                                                    <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500 text-sm">Không có cuộc hẹn nào hôm nay</p>
                                    <p className="text-gray-400 text-xs mt-1">Bạn có thể thư giãn hoặc chuẩn bị cho những ngày tới</p>
                                </div>
                            )}
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

                {/* Pending Appointments Section */}
                {pendingAppointments.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Cuộc hẹn chờ duyệt</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="space-y-4">
                                {pendingAppointments.map((appointment) => (
                                    <div key={appointment.AppointmentID} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <User className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {appointment.CustomerName || 'Khách hàng'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {appointment.CustomerEmail}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(appointment.Date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatTime(appointment.Time)}
                                                </span>
                                                <span className="text-gray-500">
                                                    ({appointment.Duration} phút)
                                                </span>
                                            </div>
                                            {appointment.Description && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Lý do:</strong> {appointment.Description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <button
                                                onClick={() => setSelectedAppointment(appointment)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleApproveAppointment(appointment.AppointmentID)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Phê duyệt
                                            </button>
                                            <button
                                                onClick={() => handleRejectAppointment(appointment.AppointmentID)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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

            {/* Appointment Detail Modal - Simplified for PendingAppointment */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Chi tiết cuộc hẹn</h3>
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
                                    <p className="font-medium text-gray-900">{selectedAppointment.CustomerName || 'Khách hàng'}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(selectedAppointment.Date)} lúc {formatTime(selectedAppointment.Time)}
                                    </p>
                                    {selectedAppointment.Duration && (
                                        <p className="text-sm text-gray-500">Thời lượng: {selectedAppointment.Duration} phút</p>
                                    )}
                                </div>
                            </div>

                            {selectedAppointment.Description && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Mô tả
                                    </h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAppointment.Description}</p>
                                </div>
                            )}

                            {selectedAppointment.MeetingURL && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Link cuộc họp</h4>
                                    <a
                                        href={selectedAppointment.MeetingURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 underline"
                                    >
                                        {selectedAppointment.MeetingURL}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    handleApproveAppointment(selectedAppointment.AppointmentID);
                                    setSelectedAppointment(null);
                                }}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Phê duyệt
                            </button>
                            <button
                                onClick={() => {
                                    handleRejectAppointment(selectedAppointment.AppointmentID);
                                    setSelectedAppointment(null);
                                }}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Từ chối
                            </button>
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

            {/* Rejection Reason Modal */}
            {isRejectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Từ chối cuộc hẹn</h2>
                        <p className="text-gray-600 mb-4">Vui lòng cho biết lý do từ chối cuộc hẹn này:</p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            maxLength={500}
                        />

                        <div className="text-sm text-gray-500 mb-4">
                            {rejectionReason.length}/500 ký tự
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={confirmRejectAppointment}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Xác nhận từ chối
                            </button>
                            <button
                                onClick={cancelRejection}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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