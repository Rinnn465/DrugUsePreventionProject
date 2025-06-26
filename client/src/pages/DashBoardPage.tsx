import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { User, BookOpen, Calendar, Clock, Users, Mail, Edit, Plus, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { Appointment } from "../types/Appointment";
import AppointmentDetailModal from "../components/modal/AppointmentDetailModal";
import { toast } from 'react-toastify';

interface ProfileFormData {
  username: string;
  email: string; // readonly - cannot be updated
  fullName: string;
  dateOfBirth: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Schedule {
  ScheduleID: number;
  ConsultantID: number;
  Date: string;
  StartTime: string;
  EndTime: string;
}

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

const DashBoardPage: React.FC = () => {
  const { userId } = useParams();
  const { user, setUser } = useUser();

  const location = useLocation();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultantDetails, setConsultantDetails] = useState<{
    name: string;
    title: string;
    imageUrl: string;
    specialties: string[];
  } | null>(null);

  // Consultant-specific states
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    selectedSlots: [] as string[]
  });
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);

  // Define time slots
  const timeSlots = [
    { id: 'slot1', label: 'SLOT 1: 8H - 9H (Sáng)', startTime: '08:00', endTime: '09:00', period: 'Sáng' },
    { id: 'slot2', label: 'SLOT 2: 9H30 - 10H30 (Sáng)', startTime: '09:30', endTime: '10:30', period: 'Sáng' },
    { id: 'slot3', label: 'SLOT 3: 11H - 12H (Sáng)', startTime: '11:00', endTime: '12:00', period: 'Sáng' },
    { id: 'slot4', label: 'SLOT 4: 1H30 - 2H30 (Chiều)', startTime: '13:30', endTime: '14:30', period: 'Chiều' },
    { id: 'slot5', label: 'SLOT 5: 3H - 4H (Chiều)', startTime: '15:00', endTime: '16:00', period: 'Chiều' },
    { id: 'slot6', label: 'SLOT 6: 4H30 - 5H30 (Chiều)', startTime: '16:30', endTime: '17:30', period: 'Chiều' },
    { id: 'slot7', label: 'SLOT 7: 7H - 8H (Tối)', startTime: '19:00', endTime: '20:00', period: 'Tối' }
  ];

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.Username || "",
    email: user?.Email || "",
    fullName: user?.FullName || "",
    dateOfBirth: user?.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check current page type
  const isCoursesPage = location.pathname.includes('/courses');
  const isEventsPage = location.pathname.includes('/events');
  const isAppointmentsPage = location.pathname.includes('/appointments');
  const isSecurityPage = location.pathname.includes('/security');

  // Check if user is a consultant
  const isConsultant = user?.RoleName === 'consultant' || user?.RoleName === 'Consultant';

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để xem lịch hẹn" });
      return;
    }
    fetch(`http://localhost:5000/api/appointment`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setAppointments(data.data || []))
      .catch(err => {
        console.error("Error fetching appointments:", err);
        setMessage({ type: "error", text: "Không thể tải danh sách lịch hẹn" });
      });
  }, [userId]);


  const fetchSchedules = useCallback(async () => {
    if (!user?.AccountID) return;

    console.log('Fetching schedules for AccountID:', user.AccountID);
    console.log('Current user:', user);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/consultant/schedules/${user.AccountID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response);

      console.log('Schedule fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched schedules:', data);

      setSchedules(data || []);

      // Extract unique dates that already have schedules
      const existingDates = [...new Set((data || []).map((schedule: Schedule) =>
        new Date(schedule.Date).toISOString().split('T')[0]
      ))] as string[];

      console.log('Scheduled dates:', existingDates);
      setScheduledDates(existingDates);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải lịch làm việc');
      // Don't fail silently - set empty arrays so the UI still works
      setSchedules([]);
      setScheduledDates([]);
    }
  }, [user]);

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
      // Don't fail silently
      setPendingAppointments([]);
    }
  }, [user?.AccountID]);

  // Fetch consultant-specific data
  useEffect(() => {
    if (isConsultant && user?.AccountID) {
      fetchSchedules();
      fetchPendingAppointments();
    }
  }, [isConsultant, user?.AccountID, fetchSchedules, fetchPendingAppointments]);

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
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime
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

  const handleApproveAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointment/${appointmentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Đã phê duyệt cuộc hẹn!');
        fetchPendingAppointments();
      } else {
        throw new Error('Không thể phê duyệt cuộc hẹn');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Có lỗi xảy ra khi phê duyệt cuộc hẹn');
    }
  };

  const handleRejectAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointment/${appointmentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Đã từ chối cuộc hẹn!');
        fetchPendingAppointments();
      } else {
        throw new Error('Không thể từ chối cuộc hẹn');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Có lỗi xảy ra khi từ chối cuộc hẹn');
    }
  };

  const formatDate = (dateString: string) => {
    // Handle different date formats that might come from the database
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }

    return date.toLocaleDateString('vi-VN');
  };

  // Helper function to check if a date is disabled (already has schedules)
  const isDateDisabled = (dateString: string) => {
    return scheduledDates.includes(dateString);
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';

    // If it's a full datetime string, extract just the time part
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1];
      return timePart.substring(0, 5);
    }

    // If it's already just a time string like "08:00:00"
    return timeString.substring(0, 5);
  };

  const getTimeSlotLabel = (startTime: string, endTime: string) => {
    const slot = timeSlots.find(slot =>
      slot.startTime === startTime && slot.endTime === endTime
    );
    return slot ? slot.label : `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const handleSlotToggle = (slotId: string) => {
    setNewSchedule(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.includes(slotId)
        ? prev.selectedSlots.filter(id => id !== slotId)
        : [...prev.selectedSlots, slotId]
    }));
  };

  // Handle profile form input changes
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Handle password form input changes
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };
  
  // Username validation (letters and numbers only)
  const isValidUsername = (username: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(username);
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    // Check JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập lại" });
      setIsLoading(false);
      return;
    }

    // Check userId
    if (!userId) {
      setMessage({ type: "error", text: "Không tìm thấy ID người dùng. Vui lòng thử lại." });
      setIsLoading(false);
      return;
    }

    // Determine changed fields (excluding email as it's readonly)
    const changedFields: Partial<ProfileFormData> = {};
    if (profileForm.username !== user?.Username) changedFields.username = profileForm.username;
    if (profileForm.fullName !== user?.FullName) changedFields.fullName = profileForm.fullName;
    if (profileForm.dateOfBirth !== (user?.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : "")) {
      changedFields.dateOfBirth = profileForm.dateOfBirth;
    }

    // Validation
    if (Object.keys(changedFields).length === 0) {
      setMessage({ type: "error", text: "Không có thông tin nào được thay đổi" });
      setIsLoading(false);
      return;
    }
    if (changedFields.username && (!changedFields.username || changedFields.username.length < 3 || changedFields.username.length > 50 || !isValidUsername(changedFields.username))) {
      setMessage({ type: "error", text: "Tên người dùng phải từ 3 đến 50 ký tự và chỉ chứa chữ cái và số" });
      setIsLoading(false);
      return;
    }
    if (changedFields.fullName && (!changedFields.fullName || changedFields.fullName.length < 2 || changedFields.fullName.length > 100)) {
      setMessage({ type: "error", text: "Họ tên phải từ 2 đến 100 ký tự" });
      setIsLoading(false);
      return;
    }
    if (changedFields.dateOfBirth && new Date(changedFields.dateOfBirth) > new Date()) {
      setMessage({ type: "error", text: "Ngày sinh không được là ngày trong tương lai" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/account/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields), // Send only changed fields
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Cập nhật hồ sơ thất bại");
      }

      setUser(result.user); // Update user context
      setIsEditingProfile(false);
      setMessage({ type: "success", text: "Hồ sơ đã được cập nhật!" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật hồ sơ";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment detail modal
  const handleAppointmentDetail = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Set loading state for consultant details
    setConsultantDetails({
      name: 'Đang tải thông tin...',
      title: '',
      imageUrl: '',
      specialties: []
    });
    
    setIsModalOpen(true);

    // Fetch consultant details
    try {
      const response = await fetch(`http://localhost:5000/api/consultant/${appointment.ConsultantID}`);
      if (response.ok) {
        const data = await response.json();
        setConsultantDetails({
          name: data.data?.Name || 'Chuyên gia tư vấn',
          title: data.data?.Title || '',
          imageUrl: data.data?.ImageUrl || '',
          specialties: data.data?.Specialties?.map((s: { Name: string }) => s.Name) || []
        });
      } else {
        setConsultantDetails({
          name: 'Không thể tải thông tin',
          title: '',
          imageUrl: '',
          specialties: []
        });
      }
    } catch (error) {
      console.error('Error fetching consultant details:', error);
      setConsultantDetails({
        name: 'Lỗi khi tải thông tin',
        title: '',
        imageUrl: '',
        specialties: []
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setConsultantDetails(null);
  };


  // Main Dashboard Page (modified to include consultant sections)
  if (!isCoursesPage && !isEventsPage && !isAppointmentsPage && !isSecurityPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Dashboard {isConsultant && <span className="text-blue-600">- Chuyên Gia Tư Vấn</span>}
              </h1>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>
              )}
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium">Đóng</button>
              </div>
            )}

            {/* Profile Information Section */}
            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500 cursor-not-allowed"
                      title="Email không thể thay đổi vì nó là duy nhất trong hệ thống"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileForm.dateOfBirth}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
                  >
                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setMessage(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tên người dùng</p>
                      <p className="font-medium text-gray-800">{user?.Username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{user?.Email}</p>
                      <p className="text-xs text-gray-500 mt-1">Không thể thay đổi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium text-gray-800">{user?.FullName || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày sinh</p>
                      <p className="font-medium text-gray-800">{user?.DateOfBirth ? parseDate(user.DateOfBirth.toString()) : "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regular Dashboard Stats */}
          <div className={`grid grid-cols-1 ${isConsultant ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}>
            <Link to={`/dashboard/${userId}/courses`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Khóa học tham gia</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Link>
            <Link to={`/dashboard/${userId}/events`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Sự kiện tham gia</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Link>
            {!isConsultant && (
              <Link to={`/dashboard/${userId}/appointments`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Lịch hẹn</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Consultant-Specific Sections */}
          {isConsultant && (
            <>
              {/* Schedule Management Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                    Lịch Làm Việc
                  </h2>
                  <button
                    onClick={() => setShowAddSchedule(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Lịch
                  </button>
                </div>

                {/* Add Schedule Form */}
                {showAddSchedule && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <form onSubmit={handleAddSchedule} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                        <input
                          type="date"
                          value={newSchedule.date}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            if (isDateDisabled(selectedDate)) {
                              toast.error('Ngày này đã có lịch làm việc. Vui lòng chọn ngày khác.');
                              return;
                            }
                            setNewSchedule({ ...newSchedule, date: selectedDate });
                          }}
                          min={getTodayString()}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${newSchedule.date && isDateDisabled(newSchedule.date)
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          required
                        />
                        {newSchedule.date && isDateDisabled(newSchedule.date) && (
                          <p className="text-red-600 text-sm mt-1">
                            ⚠️ Ngày này đã có lịch làm việc
                          </p>
                        )}
                        {scheduledDates.length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800 font-medium">
                              📅 Những ngày đã có lịch làm việc:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scheduledDates.map((date, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md"
                                >
                                  {formatDate(date)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Chọn khung giờ (có thể chọn nhiều)
                        </label>

                        {/* Morning Slots */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Sáng</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {timeSlots.filter(slot => slot.period === 'Sáng').map(slot => (
                              <label key={slot.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newSchedule.selectedSlots.includes(slot.id)}
                                  onChange={() => handleSlotToggle(slot.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{slot.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Afternoon Slots */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Chiều</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {timeSlots.filter(slot => slot.period === 'Chiều').map(slot => (
                              <label key={slot.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newSchedule.selectedSlots.includes(slot.id)}
                                  onChange={() => handleSlotToggle(slot.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{slot.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Evening Slots */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Tối</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {timeSlots.filter(slot => slot.period === 'Tối').map(slot => (
                              <label key={slot.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newSchedule.selectedSlots.includes(slot.id)}
                                  onChange={() => handleSlotToggle(slot.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{slot.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Selected slots summary */}
                        {newSchedule.selectedSlots.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-800">
                              Đã chọn {newSchedule.selectedSlots.length} khung giờ
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-md transition-colors ${newSchedule.selectedSlots.length === 0 || isDateDisabled(newSchedule.date)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          disabled={newSchedule.selectedSlots.length === 0 || isDateDisabled(newSchedule.date)}
                        >
                          {isDateDisabled(newSchedule.date)
                            ? 'Ngày đã có lịch'
                            : `Thêm ${newSchedule.selectedSlots.length > 0 ? `${newSchedule.selectedSlots.length} lịch` : 'lịch'}`
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSchedule(false);
                            setNewSchedule({ date: '', selectedSlots: [] });
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Schedule List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <div key={schedule.ScheduleID} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{formatDate(schedule.Date)}</h3>
                          <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{getTimeSlotLabel(schedule.StartTime, schedule.EndTime)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Chưa có lịch làm việc nào được thiết lập
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Appointments Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-orange-600" />
                  Cuộc Hẹn Chờ Duyệt ({pendingAppointments.length})
                </h2>

                {pendingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Không có cuộc hẹn nào chờ duyệt</p>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment.AppointmentID} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Bệnh nhân</p>
                                <p className="font-semibold">{appointment.CustomerName || 'Không rõ'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Ngày & Giờ</p>
                                <p className="font-semibold">
                                  {formatDate(appointment.Date)} - {formatTime(appointment.Time)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Thời lượng</p>
                                <p className="font-semibold">{appointment.Duration} phút</p>
                              </div>
                            </div>
                            {appointment.Description && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600">Mô tả</p>
                                <p className="text-gray-800">{appointment.Description}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleApproveAppointment(appointment.AppointmentID)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appointment.AppointmentID)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Appointment Detail Modal */}
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          consultantName={consultantDetails?.name}
          consultantTitle={consultantDetails?.title}
          consultantImageUrl={consultantDetails?.imageUrl}
          consultantSpecialties={consultantDetails?.specialties}
        />
      </div>
    );
  }

  // Courses Page
  if (isCoursesPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Khóa Học Của Tôi</h1>

            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có khóa học nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa đăng ký khóa học nào.</p>
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Khám phá khóa học
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Events Page
  if (isEventsPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sự Kiện Của Tôi</h1>

            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có sự kiện nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa đăng ký sự kiện nào.</p>
              <Link
                to="/community-programs"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Tham gia sự kiện
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Appointments Page
  if (isAppointmentsPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {isConsultant ? 'Quản Lý Lịch Hẹn - Chuyên Gia Tư Vấn' : 'Lịch Hẹn Của Tôi'}
            </h1>

            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.AppointmentID} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {isConsultant ? `Cuộc hẹn với khách hàng` : `Cuộc hẹn với chuyên viên`}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(appointment.Date)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Trạng thái: <span className={`
                            ${appointment.Status === 'confirmed' ? 'text-green-600' :
                              appointment.Status === 'pending' ? 'text-orange-600' : 'text-red-600'}
                          `}>
                            {appointment.Status === 'confirmed' ? 'Đã xác nhận' :
                              appointment.Status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                          </span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAppointmentDetail(appointment)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Chi tiết
                        </button>
                        {appointment.Status === 'confirmed' && appointment.MeetingURL && (
                          <a
                            href={appointment.MeetingURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Tham gia
                          </a>
                        )}
                      </div>
                    </div>
                    {appointment.Description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Mô tả:</p>
                        <p className="text-gray-800">{appointment.Description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có lịch hẹn nào</h3>
                <p className="text-gray-600 mb-6">
                  {isConsultant ? 'Chưa có bệnh nhân nào đặt lịch hẹn với bạn.' : 'Bạn chưa đặt lịch hẹn nào.'}
                </p>
                {!isConsultant && (
                  <Link
                    to="/appointments"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch hẹn
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Appointment Detail Modal */}
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          consultantName={consultantDetails?.name}
          consultantTitle={consultantDetails?.title}
          consultantImageUrl={consultantDetails?.imageUrl}
          consultantSpecialties={consultantDetails?.specialties}
        />
      </div>
    );
  }

  // Security Page
  if (isSecurityPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bảo Mật</h1>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cập nhật mật khẩu
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bảo mật tài khoản</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Xác thực hai yếu tố</h3>
                    <p className="text-sm text-gray-600">Tăng cường bảo mật tài khoản với xác thực hai yếu tố</p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Kích hoạt
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Phiên đăng nhập</h3>
                    <p className="text-sm text-gray-600">Quản lý các thiết bị đã đăng nhập</p>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Trang không tìm thấy</h1>
          <p className="text-gray-600">Trang bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </main>
    </div>
  );

};

export default DashBoardPage;