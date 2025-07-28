import { useUser } from "../../context/UserContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Plus,
    CheckCircle,
    X,
    User,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

// Interfaces
interface Schedule {
    ScheduleID: number;
    ConsultantID: number;
    Date: string;
    StartTime: string;
    EndTime: string;
}

interface Appointment {
    AppointmentID: number;
    ConsultantID: number;
    AccountID: number;
    Time: string;
    Date: string;
    Status: string;
    Duration: number;
    CustomerName?: string;
    CustomerEmail?: string;
}

interface Week {
    label: string;
    value: string;
    weekDates: Date[];
}

const ConsultantSchedule: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    // State management
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [scheduledDates, setScheduledDates] = useState<string[]>([]);
    const [newSchedule, setNewSchedule] = useState({
        date: '',
        selectedSlots: [] as string[]
    });

    const timeSlots = [
        { id: 'slot1', label: 'SLOT 1: 8H - 9H (Sáng)', startTime: '08:00', endTime: '09:00', period: 'Sáng' },
        { id: 'slot2', label: 'SLOT 2: 9H30 - 10H30 (Sáng)', startTime: '09:30', endTime: '10:30', period: 'Sáng' },
        { id: 'slot3', label: 'SLOT 3: 11H - 12H (Sáng)', startTime: '11:00', endTime: '12:00', period: 'Sáng' },
        { id: 'slot4', label: 'SLOT 4: 1H30 - 2H30 (Chiều)', startTime: '13:30', endTime: '14:30', period: 'Chiều' },
        { id: 'slot5', label: 'SLOT 5: 3H - 4H (Chiều)', startTime: '15:00', endTime: '16:00', period: 'Chiều' },
        { id: 'slot6', label: 'SLOT 6: 4H30 - 5H30 (Chiều)', startTime: '16:30', endTime: '17:30', period: 'Chiều' },
        { id: 'slot7', label: 'SLOT 7: 7H - 8H (Tối)', startTime: '19:00', endTime: '20:00', period: 'Tối' }
    ];

    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    // Fetch schedules
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
            data.forEach((schedule: Schedule) => {
                schedule.StartTime = formatTime(schedule.StartTime);
                schedule.EndTime = formatTime(schedule.EndTime);
            })
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
    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.includes('T')) {
            const timePart = timeString.split('T')[1];
            return timePart.substring(0, 5);
        }
        return timeString.substring(0, 5);
    };
    // Fetch appointments for the selected week
    const fetchWeekAppointments = useCallback(async () => {
        if (!user?.AccountID || !selectedWeek) return;

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

            setAppointments(data.data || []);
        } catch (error) {
            console.error('Error fetching week appointments:', error);
            toast.error('Không thể tải danh sách cuộc hẹn');
            setAppointments([]);
        }
    }, [user?.AccountID, selectedWeek]);

    // Generate week dropdown
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

            // Generate week dates
            const weekDates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setUTCDate(startDate.getUTCDate() + i);
                weekDates.push(date);
            }

            weeks.push({
                label: formatDateOfWeek(startDate) + ' đến ' + formatDateOfWeek(endDate),
                value: startDate.toISOString().split('T')[0],
                weekDates: weekDates
            });

            // Move to next week
            startDate = new Date(startDate);
            startDate.setUTCDate(startDate.getUTCDate() + 7);
        }

        return weeks;
    }, []);

    // Get current week
    const getCurrentWeekValue = (weeks: Week[]) => {
        if (weeks.length === 0) return "";

        const today = new Date();
        const todayUTC = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));

        for (const week of weeks) {
            const start = new Date(week.value + 'T00:00:00.000Z');
            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 6);
            end.setUTCHours(23, 59, 59, 999);

            if (todayUTC >= start && todayUTC <= end) {
                return week.value;
            }
        }

        return weeks[0]?.value || "";
    };

    // Helper functions
    const formatDateOfWeek = (date: Date) => {
        return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00.000Z'));
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    };

    // Get schedule for a specific date and time slot
    const getScheduleForDateTime = (date: Date, timeSlot: typeof timeSlots[0]) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedules.find(schedule =>
            schedule.Date.split('T')[0] === dateStr &&
            schedule.StartTime.substring(0, 5) === timeSlot.startTime
        );
    };

    // Get appointment for a specific date and time slot
    const getAppointmentForDateTime = (date: Date, timeSlot: typeof timeSlots[0]) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.find(appointment =>
            appointment.Date.split('T')[0] === dateStr &&
            appointment.Time.substring(0, 5) === timeSlot.startTime &&
            appointment.Status === 'confirmed'
        );
    };

    // Check if date is today
    const isToday = (date: Date) => {
        const today = new Date();
        const todayUTC = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));

        return date.getUTCDate() === todayUTC.getUTCDate() &&
            date.getUTCMonth() === todayUTC.getUTCMonth() &&
            date.getUTCFullYear() === todayUTC.getUTCFullYear();
    };

    // Handle adding new schedule
    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newSchedule.selectedSlots.length === 0) {
            toast.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        try {
            const token = localStorage.getItem('token');

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

    // Handle slot toggle
    const handleSlotToggle = (slotId: string) => {
        setNewSchedule(prev => ({
            ...prev,
            selectedSlots: prev.selectedSlots.includes(slotId)
                ? prev.selectedSlots.filter(id => id !== slotId)
                : [...prev.selectedSlots, slotId]
        }));
    };

    // Get today's date string
    const getTodayString = () => {
        const today = new Date();
        return new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        )).toISOString().split('T')[0];
    };

    // Check if date is disabled
    const isDateDisabled = (dateString: string) => {
        return scheduledDates.includes(dateString);
    };

    // Load data on component mount
    useEffect(() => {
        if (user?.AccountID) {
            fetchSchedules();
        }
    }, [user?.AccountID, fetchSchedules]);

    useEffect(() => {
        const allWeeks = generateWeekDropdown(selectedYear);
        setWeeks(allWeeks);

        const currentWeekValue = getCurrentWeekValue(allWeeks);
        setSelectedWeek(currentWeekValue);
    }, [generateWeekDropdown, selectedYear]);

    useEffect(() => {
        if (selectedWeek) {
            fetchWeekAppointments();
        }
    }, [selectedWeek, fetchWeekAppointments]);
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

    // Get current week data
    const currentWeek = weeks.find(week => week.value === selectedWeek);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate('/consultant')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                                </button>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Lịch làm việc chi tiết</h1>
                                    <p className="text-gray-600 mt-1">Quản lý lịch làm việc và cuộc hẹn</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddSchedule(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Thêm lịch</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Week Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Chọn tuần xem lịch</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tuần
                                </label>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {weeks.map((week, index) => (
                                        <option key={index} value={week.value}>
                                            {week.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Năm
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Schedule Table */}
                    {currentWeek && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Lịch tuần: {currentWeek.label}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Khung giờ
                                            </th>
                                            {currentWeek.weekDates.map((date, index) => (
                                                <th key={index} className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs text-gray-400">{daysOfWeek[index]}</span>
                                                        <span className={`text-sm ${isToday(date) ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                                                            {formatDate(date.toISOString())}
                                                        </span>
                                                        {isToday(date) && (
                                                            <span className="text-xs text-blue-600 font-medium">Hôm nay</span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {timeSlots.map((timeSlot, slotIndex) => (
                                            <tr key={timeSlot.id} className={slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {timeSlot.startTime} - {timeSlot.endTime}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{timeSlot.period}</span>
                                                    </div>
                                                </td>
                                                {currentWeek.weekDates.map((date, dateIndex) => {
                                                    const schedule = getScheduleForDateTime(date, timeSlot);
                                                    const appointment = getAppointmentForDateTime(date, timeSlot);
                                                    return (
                                                        <td key={dateIndex} className="px-6 py-4 text-center">
                                                            {appointment ? (
                                                                // Has appointment
                                                                <button
                                                                    onClick={() => handleStartVideoCall(appointment)}
                                                                    className="bg-green-100 border border-green-300 rounded-lg p-3">
                                                                    <div className="flex items-center justify-center mb-2">
                                                                        <User className="h-4 w-4 text-green-600 mr-1" />
                                                                        <span className="text-xs font-medium text-green-800">Có cuộc hẹn</span>
                                                                    </div>
                                                                    <div className="text-xs text-green-700">
                                                                        {appointment.CustomerName || 'Khách hàng'}
                                                                    </div>
                                                                </button>
                                                            ) : schedule ? (
                                                                // Has schedule but no appointment
                                                                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                                                                    <div className="flex items-center justify-center mb-1">
                                                                        <CheckCircle className="h-4 w-4 text-blue-600 mr-1" />
                                                                        <span className="text-xs font-medium text-blue-800">Có lịch</span>
                                                                    </div>
                                                                    <div className="text-xs text-blue-700">Trống</div>
                                                                </div>
                                                            ) : (
                                                                // No schedule
                                                                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                                                    <span className="text-xs text-gray-500">Không làm việc</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                {/* Add Schedule Modal */}
                {showAddSchedule && (
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
                )}
            </div>
        </AdminLayout>
    );
};

export default ConsultantSchedule;
