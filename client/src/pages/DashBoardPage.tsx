import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { User, BookOpen, Calendar, Clock, Users, Mail, Edit, Plus, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { Appointment } from "../types/Appointment";
import AppointmentDetailModal from "../components/modal/AppointmentDetailModal";
import { toast } from 'react-toastify';
import apiUtils from "@/utils/apiUtils";

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

interface EnrolledCourse {
  EnrollmentID: number;
  CourseID: number;
  AccountID: number;
  CompletedDate: string | null;
  Status: string;
  CourseName: string;
  Description: string;
  ImageUrl: string;
  IsDisabled: boolean;
}

interface EnrolledEvent {
  ProgramID: number;
  ProgramName: string;
  Type: string;
  Date: string;
  Description: string;
  Organizer: string;
  Url: string;
  ImageUrl: string;
  RegistrationDate: string;
  Status: string;
  SurveyBeforeCompleted: boolean;
  SurveyAfterCompleted: boolean;
}

interface EnrolledEventsResponse {
  data: EnrolledEvent[];
  total: number;
}

const DashBoardPage: React.FC = () => {
  const { userId } = useParams();
  const { user, setUser } = useUser();

  const location = useLocation();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState<EnrolledEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);


  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultantDetails, setConsultantDetails] = useState<{
    name: string;
    title: string;
    imageUrl: string;
    specialties: string[];
  } | null>(null);

  // Rejection modal state
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [appointmentToReject, setAppointmentToReject] = useState<number | null>(null);

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

  // Security states for profile editing
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profilePassword, setProfilePassword] = useState("");

  // Check current page type
  const isCoursesPage = location.pathname.includes('/courses');
  const isEventsPage = location.pathname.includes('/events');
  const isAppointmentsPage = location.pathname.includes('/appointments');
  const isSecurityPage = location.pathname.includes('/security');

  // Check if user is a consultant
  const isConsultant = user?.RoleName === 'consultant' || user?.RoleName === 'Consultant';

  // Fetch all appointments function
  const fetchAllAppointments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để xem lịch hẹn" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointment/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setAppointments(data.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setMessage({ type: "error", text: "Không thể tải danh sách lịch hẹn" });
    }
  }, [userId, setMessage]);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {

  }, [userId]);


  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.AccountID) return;

      setIsLoadingCourses(true);
      try {
        console.log('Fetching enrolled courses for user:', user.AccountID);
        const response = await apiUtils.courses.getEnrolledByUser(user.AccountID);
        console.log('Enrolled courses response:', response);

        // Handle the response structure - backend returns { message: string, data: array }
        const coursesData = response || [];
        setEnrolledCourses(coursesData);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        toast.error('Không thể tải danh sách khóa học đã đăng ký');
        setEnrolledCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?.AccountID]);

  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      if (!user?.AccountID) return;

      setIsLoadingEvents(true);
      try {
        console.log('Fetching enrolled events for user:', user.AccountID);
        const response = await apiUtils.programs.getMyEnrollments();
        console.log('Enrolled events response:', response);

        // Handle the response structure - backend returns { data: array, total: number }
        const responseData = response as unknown as EnrolledEventsResponse;
        const eventsData = responseData?.data || response || [];
        setEnrolledEvents(eventsData);
      } catch (error) {
        console.error('Error fetching enrolled events:', error);
        toast.error('Không thể tải danh sách sự kiện đã đăng ký');
        setEnrolledEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEnrolledEvents();
  }, [user?.AccountID]);

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
            startTime: selectedSlot.startTime + ':00', // Ensure time is in HH:mm:ss format
            endTime: selectedSlot.endTime + ':00' // Ensure time is in HH:mm:ss format
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
      await apiUtils.appointments.approve(appointmentId);
      toast.success('Đã phê duyệt cuộc hẉn!');

      // Refresh both pending appointments and main appointments list
      fetchPendingAppointments();
      fetchAllAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Có lỗi xảy ra khi phê duyệt cuộc hẹn');
    }
  };

  const handleRejectAppointment = async (appointmentId: number) => {
    setAppointmentToReject(appointmentId);
    setIsRejectionModalOpen(true);
  };

  const confirmRejectAppointment = async () => {
    if (!appointmentToReject || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await apiUtils.appointments.reject(appointmentToReject, rejectionReason.trim());
      toast.success('Đã từ chối cuộc hẹn!');

      // Refresh both pending appointments and main appointments list
      fetchPendingAppointments();
      fetchAllAppointments();

      setIsRejectionModalOpen(false);
      setRejectionReason('');
      setAppointmentToReject(null);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Có lỗi xảy ra khi từ chối cuộc hẹn');
    }
  };

  const cancelRejection = () => {
    setIsRejectionModalOpen(false);
    setRejectionReason('');
    setAppointmentToReject(null);
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
      setShowProfileEditModal(false);
      setProfilePassword("");
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

    // Reset consultant details to show loading state
    setConsultantDetails({
      name: '',
      title: '',
      imageUrl: '',
      specialties: []
    });

    // Fetch consultant details
    try {
      console.log('Fetching consultant details for ConsultantID:', appointment.ConsultantID);
      const response = await fetch(`http://localhost:5000/api/consultant/${appointment.ConsultantID}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Consultant data received:', data);

        setConsultantDetails({
          name: data.data?.Name || 'Chuyên gia tư vấn',
          title: data.data?.Title || '',
          imageUrl: data.data?.ImageUrl || '',
          specialties: data.data?.Specialties?.map((s: { Name: string }) => s.Name) || []
        });
      }
    } catch (error) {
      console.error('Error fetching consultant details:', error);
      setConsultantDetails({
        name: 'Chuyên gia tư vấn',
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
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard {isConsultant && <span className="text-indigo-600">- Chuyên Gia Tư Vấn</span>}
              </h1>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Hoạt động</span>
              </div>
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium">Đóng</button>
              </div>
            )}

            {/* Profile Information Section */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                  <p className="text-gray-600">Xem thông tin tài khoản của bạn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Tên người dùng</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.Username}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.Email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Họ và tên</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.FullName || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Ngày sinh</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.DateOfBirth ? parseDate(user.DateOfBirth.toString()) : "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Dashboard Stats */}
          <div className={`grid grid-cols-1 ${isConsultant ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}>
            <Link to={`/dashboard/${userId}/courses`} className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 block border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-semibold">Khóa học tham gia</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{enrolledCourses.length}</p>
                  <p className="text-blue-600 text-xs mt-1">Khóa học đã đăng ký</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
            </Link>

            <Link to={`/dashboard/${userId}/events`} className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 block border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-semibold">Sự kiện tham gia</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{enrolledEvents.length}</p>
                  <p className="text-green-600 text-xs mt-1">Sự kiện đã đăng ký</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </Link>

            {!isConsultant && (
              <Link to={`/dashboard/${userId}/appointments`} className="group bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 block border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-700 text-sm font-semibold">Lịch hẹn</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{appointments.length}</p>
                    <p className="text-purple-600 text-xs mt-1">Cuộc hẹn đã đặt</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-7 w-7 text-white" />
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

                {/* Schedule List - Enhanced Weekly View */}
                {schedules.length > 0 ? (
                  <div className="space-y-6">
                    {(() => {
                      // Group schedules by date
                      const groupedSchedules = schedules.reduce((acc, schedule) => {
                        const dateKey = new Date(schedule.Date).toISOString().split('T')[0];
                        if (!acc[dateKey]) {
                          acc[dateKey] = [];
                        }
                        acc[dateKey].push(schedule);
                        return acc;
                      }, {} as Record<string, typeof schedules>);

                      // Sort dates
                      const sortedDates = Object.keys(groupedSchedules).sort();

                      return sortedDates.map((dateKey) => {
                        const daySchedules = groupedSchedules[dateKey];
                        const date = new Date(dateKey);
                        const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' });
                        const dateString = date.toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });

                        // Group by time periods
                        const morningSlots = daySchedules.filter(s => {
                          const hour = parseInt(s.StartTime.split(':')[0]);
                          return hour >= 6 && hour < 12;
                        });
                        const afternoonSlots = daySchedules.filter(s => {
                          const hour = parseInt(s.StartTime.split(':')[0]);
                          return hour >= 12 && hour < 18;
                        });
                        const eveningSlots = daySchedules.filter(s => {
                          const hour = parseInt(s.StartTime.split(':')[0]);
                          return hour >= 18;
                        });

                        return (
                          <div key={dateKey} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                  <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800 capitalize">{dayName}</h3>
                                  <p className="text-sm text-gray-600">{dateString}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                  {daySchedules.length} khung giờ
                                </span>
                                <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                              </div>
                            </div>

                            {/* Time Slots Display */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Morning */}
                              {morningSlots.length > 0 && (
                                <div className="bg-white rounded-lg p-4 border">
                                  <div className="flex items-center mb-3">
                                    <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
                                    <h4 className="font-semibold text-gray-700">Sáng</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {morningSlots.map((schedule) => (
                                      <div key={schedule.ScheduleID} className="flex items-center text-sm text-gray-600">
                                        <Clock className="h-3 w-3 mr-2" />
                                        <span>{formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Afternoon */}
                              {afternoonSlots.length > 0 && (
                                <div className="bg-white rounded-lg p-4 border">
                                  <div className="flex items-center mb-3">
                                    <div className="h-2 w-2 bg-orange-400 rounded-full mr-2"></div>
                                    <h4 className="font-semibold text-gray-700">Chiều</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {afternoonSlots.map((schedule) => (
                                      <div key={schedule.ScheduleID} className="flex items-center text-sm text-gray-600">
                                        <Clock className="h-3 w-3 mr-2" />
                                        <span>{formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Evening */}
                              {eveningSlots.length > 0 && (
                                <div className="bg-white rounded-lg p-4 border">
                                  <div className="flex items-center mb-3">
                                    <div className="h-2 w-2 bg-purple-400 rounded-full mr-2"></div>
                                    <h4 className="font-semibold text-gray-700">Tối</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {eveningSlots.map((schedule) => (
                                      <div key={schedule.ScheduleID} className="flex items-center text-sm text-gray-600">
                                        <Clock className="h-3 w-3 mr-2" />
                                        <span>{formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có lịch làm việc</h3>
                    <p className="text-gray-600">Bấm "Thêm Lịch" để thiết lập lịch làm việc của bạn</p>
                  </div>
                )}
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
                  onClick={cancelRejection}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmRejectAppointment}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Courses Page
  if (isCoursesPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
                  <p className="text-gray-600">Quản lý và theo dõi tiến độ học tập</p>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              {isLoadingCourses ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-6 text-lg">Đang tải khóa học...</p>
                </div>
              ) : enrolledCourses.length > 0 ? (
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.EnrollmentID} className="group bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                      <div className="flex">
                        {/* Course Image */}
                        <div className="flex-shrink-0">
                          {course.ImageUrl ? (
                            <img
                              src={course.ImageUrl}
                              alt={course.CourseName}
                              className="w-56 h-40 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-56 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-blue-500" />
                            </div>
                          )}
                        </div>

                        {/* Course Content */}
                        <div className="flex-1 p-8">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{course.CourseName}</h3>
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  Khóa học trực tuyến
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/courses/${course.CourseID}`}
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            >
                              <BookOpen className="h-4 w-4" />
                              <span>{course.Status.toLowerCase() === 'completed' ? 'Xem lại' : 'Tiếp tục học'}</span>
                            </Link>
                          </div>

                          {/* Status and Date */}
                          <div className="flex items-center space-x-6 mb-4">
                            {course.Status.toLowerCase() === 'completed' ? (
                              <div className="flex items-center px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-green-700 font-semibold text-sm">
                                  Hoàn thành vào {course.CompletedDate ? formatDate(course.CompletedDate) : 'Không rõ'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="text-blue-700 font-semibold text-sm">Đang học</span>
                              </div>
                            )}
                          </div>

                          {/* Course Description */}
                          <p className="text-gray-700 leading-relaxed line-clamp-3">{course.Description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có khóa học nào</h3>
                  <p className="text-gray-600 mb-8 text-lg">Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học thú vị!</p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Khám phá khóa học</span>
                  </Link>
                </div>
              )}
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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Sự kiện của tôi</h1>
                  <p className="text-gray-600">Theo dõi các sự kiện đã tham gia và sắp tới</p>
                </div>
              </div>
            </div>

            {/* Events Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              {isLoadingEvents ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-6 text-lg">Đang tải sự kiện...</p>
                </div>
              ) : enrolledEvents.length > 0 ? (
                <div className="space-y-6">
                  {enrolledEvents.map((event) => (
                    <div key={event.ProgramID} className="group bg-gradient-to-r from-white to-green-50 border border-green-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                      <div className="flex">
                        {/* Event Image */}
                        <div className="flex-shrink-0">
                          {event.ImageUrl ? (
                            <img
                              src={event.ImageUrl}
                              alt={event.ProgramName}
                              className="w-56 h-40 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-56 h-40 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                              <Users className="h-12 w-12 text-green-500" />
                            </div>
                          )}
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 p-8">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{event.ProgramName}</h3>
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Users className="h-3 w-3 mr-1" />
                                  {event.Type}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {event.Organizer}
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/community-programs/${event.ProgramID}`}
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            >
                              <Users className="h-4 w-4" />
                              <span>Xem chi tiết</span>
                            </Link>
                          </div>

                          {/* Status and Date */}
                          <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                              <Calendar className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-700 font-semibold text-sm">
                                {formatDate(event.Date)}
                              </span>
                            </div>
                            <div className="flex items-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-blue-700 font-semibold text-sm">
                                Đã đăng ký vào {formatDate(event.RegistrationDate)}
                              </span>
                            </div>
                          </div>

                          {/* Event Description */}
                          <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">{event.Description}</p>

                          {/* Survey Status */}
                          <div className="flex items-center space-x-4">
                            <div className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium ${event.SurveyBeforeCompleted ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                              {event.SurveyBeforeCompleted ? (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              <span>Khảo sát trước</span>
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium ${event.SurveyAfterCompleted ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                              {event.SurveyAfterCompleted ? (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              <span>Khảo sát sau</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="h-24 w-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có sự kiện nào</h3>
                  <p className="text-gray-600 mb-8 text-lg">Bạn chưa tham gia sự kiện nào. Hãy khám phá các sự kiện thú vị!</p>
                  <Link
                    to="/community-programs"
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Users className="h-5 w-5" />
                    <span>Tham gia sự kiện</span>
                  </Link>
                </div>
              )}
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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isConsultant ? 'Quản lý lịch hẹn' : 'Lịch hẹn của tôi'}
                  </h1>
                  <p className="text-gray-600">
                    {isConsultant ? 'Quản lý và theo dõi lịch hẹn từ khách hàng' : 'Theo dõi các cuộc hẹn tư vấn của bạn'}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointments Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              {appointments.length > 0 ? (
                <div className="space-y-6">
                  {appointments.map((appointment) => (
                    <div key={appointment.AppointmentID} className="group bg-gradient-to-r from-white to-purple-50 border border-purple-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {isConsultant ? `Cuộc hẹn với khách hàng` : `Cuộc hẹn với chuyên viên`}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {formatDate(appointment.Date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${appointment.Status === 'confirmed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : appointment.Status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {appointment.Status === 'confirmed' && <CheckCircle className="h-4 w-4 mr-2" />}
                              {appointment.Status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                              {appointment.Status === 'cancelled' && <XCircle className="h-4 w-4 mr-2" />}
                              {appointment.Status === 'confirmed' ? 'Đã xác nhận' :
                                appointment.Status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAppointmentDetail(appointment)}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Chi tiết</span>
                          </button>
                          {appointment.Status === 'confirmed' && appointment.MeetingURL && (
                            <a
                              href={appointment.MeetingURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            >
                              <Users className="h-4 w-4" />
                              <span>Tham gia</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {appointment.Description && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm font-medium text-gray-600 mb-2">Mô tả:</p>
                          <p className="text-gray-800 leading-relaxed">{appointment.Description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="h-24 w-24 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có lịch hẹn nào</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {isConsultant ? 'Chưa có bệnh nhân nào đặt lịch hẹn với bạn.' : 'Bạn chưa đặt lịch hẹn nào. Hãy đặt lịch tư vấn ngay!'}
                  </p>
                  {!isConsultant && (
                    <Link
                      to="/appointments"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Đặt lịch hẹn</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
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
                  onClick={cancelRejection}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmRejectAppointment}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Security Page
  if (isSecurityPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Bảo mật </h1>
                  <p className="text-gray-600">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex justify-between items-center ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium hover:underline">Đóng</button>
              </div>
            )}

            {/* Profile Edit Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa thông tin cá nhân</h2>
                    <p className="text-gray-600 text-sm">Cập nhật thông tin tài khoản của bạn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEditModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Edit className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
                  <p className="text-gray-600 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Profile Edit Modal with Password Verification */}
          {showProfileEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Xác thực để chỉnh sửa thông tin</h2>
                  <button
                    onClick={() => {
                      setShowProfileEditModal(false);
                      setProfilePassword("");
                      setIsEditingProfile(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-yellow-800 text-sm flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Để bảo mật, vui lòng nhập mật khẩu của bạn để xác thực trước khi chỉnh sửa thông tin.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Mật khẩu tài khoản</label>
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nhập mật khẩu của bạn"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setShowProfileEditModal(false);
                          setProfilePassword("");
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          if (profilePassword.trim()) {
                            setIsEditingProfile(true);
                          } else {
                            setMessage({ type: "error", text: "Vui lòng nhập mật khẩu để xác thực" });
                          }
                        }}
                        disabled={!profilePassword.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                      >
                        Xác thực
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Tên người dùng</label>
                        <input
                          type="text"
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                          title="Email không thể thay đổi vì nó là duy nhất trong hệ thống"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Họ và tên</label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileForm.fullName}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Ngày sinh</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setShowProfileEditModal(false);
                          setProfilePassword("");
                          setMessage(null);
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-300 transition-all"
                      >
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
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