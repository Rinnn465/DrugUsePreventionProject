import { useUser } from "../../context/UserContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as apiUtils from '../../utils/apiUtils';
import { getVideoCallAvailabilityInfo } from '../../utils/appointmentUtils';
import {
    Calendar,
    MessageCircle,
    TrendingUp,
    Stethoscope,
    Clock,
    Search,
    X,
    User,
    TrendingDown,
    Video,
    ExternalLink,
    Plus,
    CheckCircle,
    Star,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

// Interfaces for appointment management
interface Appointment {
    AppointmentID: number;
    ConsultantID: number;
    AccountID: number;
    Time: string;
    Date: string;
    MeetingURL?: string;
    Status: string;
    Description?: string;
    Duration: number;
    RejectedReason?: string;
    Rating?: number;
    Feedback?: string;
    CustomerName?: string;
    CustomerEmail?: string;
}

interface Schedule {
    ScheduleID: number;
    ConsultantID: number;
    Date: string;
    StartTime: string;
    EndTime: string;
}

interface Week {
    label: string;
    value: string; // SQL date format
}


const ConsultantPage: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const isShowCall = import.meta.env.VITE_IS_SHOW_CALL_WHEN_NOT_TIME === 'true';

    // State management for modals and popups
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // All appointments modal filters and search
    const [appointmentSearchQuery, setAppointmentSearchQuery] = useState("");
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Appointment management state
    const [thisWeekAppointments, setThisWeekAppointments] = useState<Appointment[]>([]);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [isLoadingThisWeekAppointments, setIsLoadingThisWeekAppointments] = useState(false);

    // Rejection modal state
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [appointmentToReject, setAppointmentToReject] = useState<number | null>(null);

    // Schedule management state
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        date: '',
        selectedSlots: [] as string[]
    });
    const [scheduledDates, setScheduledDates] = useState<string[]>([]);

    const [compareMonthAppointments, setCompareMonthAppointments] = useState({
        lastMonth: 0,
        thisMonth: 0
    });

    const [averageRating, setAverageRating] = useState<number | null>(null);

    const calculateChange = (lastMonthNumber: number, thisMonthNumber: number) => {
        if (lastMonthNumber === 0) {
            return thisMonthNumber > 0 ? "Tăng" : "Không thay đổi";
        }
        const change = ((thisMonthNumber - lastMonthNumber) / lastMonthNumber) * 100;
        return `${change.toFixed(2)}%`;
    }

    const statsCards = [
        {
            title: "Cuộc hẹn tháng này so với tháng trước",
            value: compareMonthAppointments.thisMonth,
            change: calculateChange(compareMonthAppointments.lastMonth, compareMonthAppointments.thisMonth),
            icon: Calendar,
            color: "bg-blue-500",
            trend: compareMonthAppointments.thisMonth > compareMonthAppointments.lastMonth ? "increase" : "decrease"
        },
        {
            title: "Rating trung bình so với tháng trước",
            value: averageRating !== null ? averageRating.toFixed(1) : 'Chưa có',
            change: calculateChange(0, averageRating || 0),
            icon: Star,
            color: "bg-yellow-500",
            trend: averageRating !== null ? (averageRating > 0 ? "increase" : averageRating === 0 ? "unchanged" : "decrease") : "unchanged"
        },
    ]
    console.log(statsCards[1].change);

    const timeSlots = [
        { id: 'slot1', label: 'SLOT 1: 8H - 9H (Sáng)', startTime: '08:00', endTime: '09:00', period: 'Sáng' },
        { id: 'slot2', label: 'SLOT 2: 9H30 - 10H30 (Sáng)', startTime: '09:30', endTime: '10:30', period: 'Sáng' },
        { id: 'slot3', label: 'SLOT 3: 11H - 12H (Sáng)', startTime: '11:00', endTime: '12:00', period: 'Sáng' },
        { id: 'slot4', label: 'SLOT 4: 1H30 - 2H30 (Chiều)', startTime: '13:30', endTime: '14:30', period: 'Chiều' },
        { id: 'slot5', label: 'SLOT 5: 3H - 4H (Chiều)', startTime: '15:00', endTime: '16:00', period: 'Chiều' },
        { id: 'slot6', label: 'SLOT 6: 4H30 - 5H30 (Chiều)', startTime: '16:30', endTime: '17:30', period: 'Chiều' },
        { id: 'slot7', label: 'SLOT 7: 7H - 8H (Tối)', startTime: '19:00', endTime: '20:00', period: 'Tối' }
    ];

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


    const fetchWeekAppointments = useCallback(async () => {
        if (!user?.AccountID || !selectedWeek) return;

        setIsLoadingThisWeekAppointments(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/consultant/week-appointments/${user.AccountID}/${selectedWeek}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            data.data.forEach((item: Appointment) => {
                item.Time = formatTime(item.Time);
            })

            setThisWeekAppointments(data.data || []);
        } catch (error) {
            console.error('Error fetching this Week appointments:', error);
            toast.error('Không thể tải danh sách cuộc hẹn tháng này');
            setThisWeekAppointments([]);
        } finally {
            setIsLoadingThisWeekAppointments(false);
        }
    }, [user?.AccountID, selectedWeek]);

    const fetchAllAppointments = useCallback(async () => {
        try {
            const allAppointments = await apiUtils.appointments.getByConsultantId(user?.AccountID)
            setAllAppointments(allAppointments || []);
        } catch (error) {
            console.log(error);

        }
    }, [user?.AccountID]);

    const fetchSchedules = useCallback(async () => {
        if (!user?.AccountID) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/consultant/schedules/${user.AccountID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setSchedules(data || []);

            // Extract unique dates that already have schedules
            const existingDates = [...new Set((data || []).map((schedule: Schedule) =>
                new Date(schedule.Date).toISOString().split('T')[0]
            ))] as string[];

            setScheduledDates(existingDates);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast.error('Không thể tải lịch làm việc');
            setSchedules([]);
            setScheduledDates([]);
        }
    }, [user?.AccountID]);

    const fetchAverageRating = useCallback(async () => {
        if (!user?.AccountID) return;

        try {
            const response = await apiUtils.consultants.getAverageRating(user.AccountID);
            setAverageRating(response.averageRating);
        } catch (error) {
            console.error('Error fetching average rating:', error);
            toast.error('Không thể tải đánh giá trung bình');
            setAverageRating(null);
        }
    }, [user?.AccountID]);


    // Handle adding new schedule
    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newSchedule.selectedSlots.length === 0) {
            toast.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        // Check if the selected date is disabled
        if (isDateDisabled(newSchedule.date)) {
            toast.error('Ngày này đã có lịch làm việc. Vui lòng chọn ngày khác.');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Create multiple schedule entries for each selected slot
            const schedulePromises = newSchedule.selectedSlots.map(slotId => {
                const selectedSlot = timeSlots.find(slot => slot.id === slotId);
                if (!selectedSlot) return null;

                return fetch('http://localhost:5000/api/consultant/schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        consultantId: user?.AccountID,
                        date: newSchedule.date,
                        startTime: selectedSlot.startTime + ':00',
                        endTime: selectedSlot.endTime + ':00'
                    })
                });
            }).filter(promise => promise !== null);

            const results = await Promise.all(schedulePromises);
            const failedRequests = results.filter(result => !result.ok);

            if (failedRequests.length === 0) {
                toast.success(`Thêm ${newSchedule.selectedSlots.length} lịch làm việc thành công!`);
                setShowAddSchedule(false);
                setNewSchedule({ date: '', selectedSlots: [] });
                fetchSchedules();
            } else {
                throw new Error(`Có ${failedRequests.length} lịch không thể thêm được`);
            }
        } catch (error) {
            console.error('Error adding schedule:', error);
            toast.error('Có lỗi xảy ra khi thêm lịch làm việc');
        }
    };

    // Helper function to check if a date is disabled (already has schedules)
    const isDateDisabled = (dateString: string) => {
        return scheduledDates.includes(dateString);
    };

    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayString = () => {
        const today = new Date();
        return new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        )).toISOString().split('T')[0];
    };

    // Handle slot toggle for schedule creation
    const handleSlotToggle = (slotId: string) => {
        setNewSchedule(prev => ({
            ...prev,
            selectedSlots: prev.selectedSlots.includes(slotId)
                ? prev.selectedSlots.filter(id => id !== slotId)
                : [...prev.selectedSlots, slotId]
        }));
    };

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
        const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00.000Z'));
        if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateString);
            return 'Invalid Date';
        }
        // Format in UTC
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.includes('T')) {
            const timePart = timeString.split('T')[1];
            return timePart.substring(0, 5);
        }
        return timeString.substring(0, 5);
    };

    // Get available years from appointments
    const getAvailableYears = () => {
        const years = new Set(allAppointments.map(appointment =>
            new Date(appointment.Date).getFullYear()
        ));
        return Array.from(years).sort((a, b) => b - a);
    };

    const generateWeekDropdown = useCallback((year: number) => {
        const weeks = [];

        // Start from the first Monday of the year in UTC
        let startDate = new Date(Date.UTC(year, 0, 1));
        const day = startDate.getUTCDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        startDate.setUTCDate(startDate.getUTCDate() + diffToMonday);

        while (startDate.getUTCFullYear() <= year) {
            const endDate = new Date(startDate);
            endDate.setUTCDate(startDate.getUTCDate() + 6);

            // Stop if we've gone past the current year
            if (endDate.getUTCFullYear() > year) break;

            weeks.push({
                label: formatDateOfWeek(startDate) + ' đến ' + formatDateOfWeek(endDate),
                value: startDate.toISOString().split('T')[0] // YYYY-MM-DD format in UTC
            });

            // Move to next week
            startDate = new Date(startDate);
            startDate.setUTCDate(startDate.getUTCDate() + 7);
        }

        return weeks;
    }, []);

    const getCurrentWeekValue = (weeks: Week[]) => {
        if (weeks.length === 0) return "";

        // Get current UTC date
        const today = new Date();
        const todayUTC = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));


        for (const week of weeks) {
            const start = new Date(week.value + 'T00:00:00.000Z'); // Parse as UTC
            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 6);
            end.setUTCHours(23, 59, 59, 999);

            if (todayUTC >= start && todayUTC <= end) {
                return week.value;
            }
        }

        // If no current week found, return the closest week
        const todayTime = todayUTC.getTime();
        let closestWeek = weeks[0];
        let minDiff = Math.abs(todayTime - new Date(weeks[0].value + 'T00:00:00.000Z').getTime());

        for (const week of weeks) {
            const weekStart = new Date(week.value + 'T00:00:00.000Z');
            const diff = Math.abs(todayTime - weekStart.getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closestWeek = week;
            }
        }

        return closestWeek.value;
    }

    const formatDateOfWeek = (date: Date) => {
        return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
    }

    const generateVideoCallUrl = (appointment: Appointment) => {
        const appointmentData = {
            appointmentId: appointment.AppointmentID,
            isConsultant: true,
            appointmentDetails: {
                customerName: appointment.CustomerName,
                consultantName: user?.FullName || user?.Username || 'Chuyên viên tư vấn',
                time: formatTime(appointment.Time),
                date: formatDate(appointment.Date),
            }
        };

        const encodedData = encodeURIComponent(JSON.stringify(appointmentData));
        return `/video-call?data=${encodedData}`;
    };

    const handleStartVideoCall = (appointment: Appointment) => {
        const videoCallUrl = generateVideoCallUrl(appointment);
        const videoCallWindow = window.open(
            videoCallUrl,
            '_blank',
            'width=1200,height=800,resizable=yes,scrollbars=yes'
        );

        if (!videoCallWindow) {
            toast.error('Vui lòng cho phép popup để mở cuộc gọi video');
        }
    };

    const filteredAppointments = (() => {
        let filtered = thisWeekAppointments;

        // Filter by search query
        if (appointmentSearchQuery.trim()) {
            filtered = filtered.filter(appointment =>
            (appointment.CustomerName?.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                appointment.CustomerEmail?.toLowerCase().includes(appointmentSearchQuery.toLowerCase()))
            );
        }

        return filtered;
    })();

    // Load data on component mount
    useEffect(() => {
        if (user?.AccountID) {
            fetchAllAppointments();
            fetchWeekAppointments();
            fetchCompareMonthAppointments();
            fetchSchedules();
            fetchAverageRating();
        }
    }, [user?.AccountID, fetchWeekAppointments, fetchCompareMonthAppointments, fetchSchedules, fetchAverageRating, fetchAllAppointments]);

    useEffect(() => {
        const allWeeks = generateWeekDropdown(selectedYear);
        setWeeks(allWeeks);

        const currentWeekValue = getCurrentWeekValue(allWeeks);
        setSelectedWeek(currentWeekValue);

    }, [generateWeekDropdown, selectedYear]);

    return (
        <AdminLayout>
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
                                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Chuyên viên</h1>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className=" border-b border-gray-200 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Search Box */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tìm kiếm khách hàng
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Nhập tên hoặc email khách hàng..."
                                                value={appointmentSearchQuery}
                                                onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    {/* Month Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tuần
                                        </label>
                                        <select
                                            value={selectedWeek}
                                            onChange={(e) => {
                                                setSelectedWeek(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {weeks.map((week, index) => (
                                                <option key={index} value={week.value}>
                                                    {week.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Year Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Năm
                                        </label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {getAvailableYears().map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* This Month Appointments Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                                    Lịch tuần này ({filteredAppointments.length})
                                </h3>
                                {!isLoadingThisWeekAppointments && filteredAppointments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">Không có yêu cầu cuộc hẹn nào trong tuần này</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {thisWeekAppointments.map((appointment) => (
                                            <div key={appointment.AppointmentID} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-all">
                                                <div
                                                    onClick={() => setSelectedAppointment(appointment)}
                                                    className="flex items-center justify-between cursor-pointer">
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
                                                                    {appointment.CustomerEmail || 'Chưa có email'}
                                                                </p>
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
                            {/* Schedule Management */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                        Lịch làm việc tuần này
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => navigate('/consultant/schedule')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            <span>Xem lịch đầy đủ</span>
                                        </button>
                                        <button
                                            onClick={() => setShowAddSchedule(true)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Thêm lịch</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Current Week Schedule Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                                    Khung giờ
                                                </th>
                                                {(() => {
                                                    const currentWeek = weeks.find(week => week.value === selectedWeek);
                                                    if (!currentWeek) return null;
                                                    const weekDates = [];
                                                    const startDate = new Date(currentWeek.value + 'T00:00:00.000Z');
                                                    for (let i = 0; i < 7; i++) {
                                                        const date = new Date(startDate);
                                                        date.setUTCDate(startDate.getUTCDate() + i);
                                                        weekDates.push(date);
                                                    }
                                                    return weekDates.map((date, index) => {
                                                        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
                                                        const isToday = (() => {
                                                            const today = new Date();
                                                            const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                                                            return date.getUTCDate() === todayUTC.getUTCDate() &&
                                                                date.getUTCMonth() === todayUTC.getUTCMonth() &&
                                                                date.getUTCFullYear() === todayUTC.getUTCFullYear();
                                                        })();
                                                        return (
                                                            <th key={index} className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-xs text-gray-400">{dayNames[index]}</span>
                                                                    <span className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                                                                        {date.getUTCDate()}/{date.getUTCMonth() + 1}
                                                                    </span>
                                                                    {isToday && (
                                                                        <span className="text-xs text-blue-600 font-medium">Hôm nay</span>
                                                                    )}
                                                                </div>
                                                            </th>
                                                        );
                                                    });
                                                })()}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {timeSlots.map((timeSlot, slotIndex) => {
                                                return (
                                                    <tr key={timeSlot.id} className={slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {timeSlot.startTime} - {timeSlot.endTime}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{timeSlot.period}</span>
                                                            </div>
                                                        </td>
                                                        {(() => {
                                                            const currentWeek = weeks.find(week => week.value === selectedWeek);
                                                            if (!currentWeek) return null;
                                                            const weekDates = [];
                                                            const startDate = new Date(currentWeek.value + 'T00:00:00.000Z');
                                                            for (let i = 0; i < 7; i++) {
                                                                const date = new Date(startDate);
                                                                date.setUTCDate(startDate.getUTCDate() + i);
                                                                weekDates.push(date);
                                                            }
                                                            return weekDates.map((date, dateIndex) => {
                                                                const dateStr = date.toISOString().split('T')[0];
                                                                const schedule = schedules.find(s =>
                                                                    s.Date.split('T')[0] === dateStr &&
                                                                    s.StartTime.substring(0, 5) === timeSlot.startTime
                                                                );
                                                                const appointment = thisWeekAppointments.find(a =>
                                                                    a.Date.split('T')[0] === dateStr &&
                                                                    a.Time.substring(0, 5) === timeSlot.startTime &&
                                                                    a.Status === 'confirmed'
                                                                );
                                                                return (
                                                                    <td key={dateIndex} className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0">
                                                                        {appointment ? (
                                                                            <button
                                                                                onClick={() => handleStartVideoCall(appointment)}
                                                                                className="bg-green-100 border border-green-300 rounded-lg p-2">
                                                                                <div
                                                                                    className="flex items-center justify-center mb-1">
                                                                                    <User className="h-3 w-3 text-green-600 mr-1" />
                                                                                    <span className="text-xs font-medium text-green-800">Có hẹn</span>
                                                                                </div>
                                                                                <div className="text-xs text-green-700 truncate">
                                                                                    {appointment.CustomerName || 'KH'}
                                                                                </div>
                                                                            </button>
                                                                        ) : schedule ? (
                                                                            <div className="bg-blue-100 border border-blue-300 rounded-lg p-2">
                                                                                <div className="flex items-center justify-center mb-1">
                                                                                    <CheckCircle className="h-3 w-3 text-blue-600 mr-1" />
                                                                                    <span className="text-xs font-medium text-blue-800">Trống</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                                                                                <span className="text-xs text-gray-500">-</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            });
                                                        })()}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="flex align-center justify-center mt-4">
                                        <button
                                            onClick={() => navigate('/consultant/schedule')}
                                            className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                                        >
                                            Xem tất cả
                                        </button>
                                    </div>
                                </div>
                                {/* Summary Stats */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                            <div>
                                                <p className="text-sm text-blue-800 font-medium">Tổng lịch tuần này</p>
                                                <p className="text-lg font-bold text-blue-900">
                                                    {(() => {
                                                        const currentWeek = weeks.find(week => week.value === selectedWeek);
                                                        if (!currentWeek) return 0;
                                                        const startDate = new Date(currentWeek.value + 'T00:00:00.000Z');
                                                        const endDate = new Date(startDate);
                                                        endDate.setUTCDate(startDate.getUTCDate() + 6);
                                                        return schedules.filter(schedule => {
                                                            const scheduleDate = new Date(schedule.Date);
                                                            return scheduleDate >= startDate && scheduleDate <= endDate;
                                                        }).length;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <p className="text-sm text-green-800 font-medium">Cuộc hẹn tuần này</p>
                                                <p className="text-lg font-bold text-green-900">{thisWeekAppointments.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                            <div>
                                                <p className="text-sm text-yellow-800 font-medium">Slot trống</p>
                                                <p className="text-lg font-bold text-yellow-900">
                                                    {(() => {
                                                        const currentWeek = weeks.find(week => week.value === selectedWeek);
                                                        if (!currentWeek) return 0;
                                                        const startDate = new Date(currentWeek.value + 'T00:00:00.000Z');
                                                        const endDate = new Date(startDate);
                                                        endDate.setUTCDate(startDate.getUTCDate() + 6);
                                                        const weekSchedules = schedules.filter(schedule => {
                                                            const scheduleDate = new Date(schedule.Date);
                                                            return scheduleDate >= startDate && scheduleDate <= endDate;
                                                        });
                                                        const weekAppointments = thisWeekAppointments.filter(app => app.Status === 'confirmed');
                                                        return weekSchedules.length - weekAppointments.length;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="mt-8">
                                {statsCards.map((card, index) => {
                                    const IconComponent = card.icon;
                                    return (
                                        <div
                                            key={index}
                                            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all mt-4`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                                        {card.title}
                                                    </p>
                                                    <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                                                    <div className="flex items-center">
                                                        {card.value !== 0 && (
                                                            card.trend === "increase" ? (
                                                                <>
                                                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                                    <span className="text-sm text-green-600 font-medium">{card.change}</span>
                                                                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                                                                </>
                                                            ) : card.trend === "decrease" ? (
                                                                <>
                                                                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                                    <span className="text-sm text-red-600 font-medium">{card.change}</span>
                                                                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-sm text-yellow-600 font-medium">{card.change}</span>
                                                                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                                                                </>
                                                            )
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
                        </div>
                    </div>
                </div>
                {/* Appointment Detail Modal - Simplified for PendingAppointment */}
                {
                    selectedAppointment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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
                                        <div className="flex justify-between items-center w-full">
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedAppointment.CustomerName || 'Khách hàng'}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(selectedAppointment.Date)} lúc {formatTime(selectedAppointment.Time)}
                                                </p>
                                                {selectedAppointment.Duration && (
                                                    <p className="text-sm text-gray-500">Thời lượng: {selectedAppointment.Duration} phút</p>
                                                )}
                                            </div>
                                            <div className="self-start">
                                                {selectedAppointment.Rating && (
                                                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                                        <span>Đánh giá: {selectedAppointment.Rating}</span>
                                                        <Star size={16} className="text-yellow-500 fill-yellow-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedAppointment.Description && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                Lưu ý của khách hàng
                                            </h4>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAppointment.Description}</p>
                                        </div>
                                    )}
                                    {selectedAppointment.RejectedReason && (
                                        <>
                                            <div className="border-t pt-4">
                                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                    <X className="h-4 w-4 text-red-600" />
                                                    Lý do từ chối
                                                </h4>
                                                <p className="text-lg font-semibold text-gray-600 bg-red-50 p-3 rounded-lg">
                                                    {selectedAppointment.RejectedReason}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {/* Video Call and Meeting URL Section */}
                                    <div className="border-t pt-4">
                                        {selectedAppointment.Status === 'confirmed' ? (
                                            <>
                                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                    <Video className="h-4 w-4" />
                                                    Cuộc gọi video
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="font-medium flex items-center justify-center gap-2">
                                                        {(() => {
                                                            // Get video call availability info
                                                            const videoCallInfo = getVideoCallAvailabilityInfo(
                                                                selectedAppointment.Date,
                                                                selectedAppointment.Time,
                                                                selectedAppointment.Duration
                                                            );
                                                            return isShowCall && videoCallInfo.isAvailable ? (
                                                                <button
                                                                    onClick={() => handleStartVideoCall(selectedAppointment)}
                                                                    className="w-full flex justify-center items-center gap-2 w-full bg-green-600 text-white px-4 py-3
                                                                    hover:bg-green-700 rounded-lg
                                                                    "
                                                                    title={videoCallInfo.tooltipText}
                                                                >
                                                                    <Video className="h-4 w-4" />
                                                                    {videoCallInfo.buttonText}
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-2 bg-gray-500 px-4 py-3 rounded-lg
                                                                text-center text-gray-100 cursor-not-allowed">
                                                                    <span>
                                                                        {(videoCallInfo.isAvailable && isShowCall) ? videoCallInfo.buttonText : `Cuộc gọi video sẽ bắt đầu vào ngày ${formatDate(selectedAppointment.Date)} lúc ${formatTime(selectedAppointment.Time)}`}
                                                                    </span>
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                                {selectedAppointment.Status === 'confirmed' && <div className="mt-2 flex">
                                    <button
                                        onClick={() => {
                                            handleRejectAppointment(selectedAppointment.AppointmentID);
                                            setSelectedAppointment(null);
                                        }}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Từ chối
                                    </button>
                                </div>}
                            </div>
                        </div>
                    )
                }
                {/* Rejection Reason Modal */}
                {
                    isRejectionModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
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
                    )
                }
                {/* Add Schedule Modal */}
                {
                    showAddSchedule && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center">
                                            <Calendar className="h-6 w-6 mr-3" />
                                            Thêm lịch làm việc mới
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowAddSchedule(false);
                                                setNewSchedule({ date: '', selectedSlots: [] });
                                            }}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleAddSchedule} className="p-6">
                                    <div className="space-y-6">
                                        {/* Date Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Chọn ngày làm việc
                                            </label>
                                            <input
                                                type="date"
                                                value={newSchedule.date}
                                                onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                                                min={getTodayString()}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${newSchedule.date && isDateDisabled(newSchedule.date)
                                                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                    }`}
                                                required
                                            />
                                            {newSchedule.date && isDateDisabled(newSchedule.date) && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <X className="h-4 w-4 mr-1" />
                                                    Ngày này đã có lịch làm việc. Vui lòng chọn ngày khác.
                                                </p>
                                            )}
                                        </div>
                                        {/* Time Slots Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Chọn khung giờ làm việc
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {timeSlots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${newSchedule.selectedSlots.includes(slot.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                            }`}
                                                        onClick={() => handleSlotToggle(slot.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {slot.startTime} - {slot.endTime}
                                                                </p>
                                                                <p className="text-sm text-gray-600">{slot.period}</p>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border-2 ${newSchedule.selectedSlots.includes(slot.id)
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-gray-300'
                                                                }`}>
                                                                {newSchedule.selectedSlots.includes(slot.id) && (
                                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {newSchedule.selectedSlots.length === 0 && (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Vui lòng chọn ít nhất một khung giờ làm việc
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex space-x-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddSchedule(false);
                                                setNewSchedule({ date: '', selectedSlots: [] });
                                            }}
                                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className={`flex-1 px-6 py-3 rounded-xl transition-all font-medium ${newSchedule.selectedSlots.length === 0 || isDateDisabled(newSchedule.date)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                                                }`}
                                            disabled={newSchedule.selectedSlots.length === 0 || isDateDisabled(newSchedule.date)}
                                        >
                                            {isDateDisabled(newSchedule.date)
                                                ? 'Ngày không khả dụng'
                                                : `Thêm ${newSchedule.selectedSlots.length} lịch làm việc`
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div >
        </AdminLayout>
    );
};

export default ConsultantPage;