import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import Avatar from "../components/common/Avatar";
import ImageCropModal from "../components/modal/ImageCropModal";
import { parseDate } from "../utils/parseDateUtils";
import { User, BookOpen, Calendar, Clock, Users, Mail, CheckCircle, XCircle, Camera, Lock } from "lucide-react";
import { Appointment } from "../types/Appointment";
import AppointmentDetailModal from "../components/modal/AppointmentDetailModal";
import { toast } from 'react-toastify';
import { validateImageFile } from "../utils/imageUtils";
import apiUtils from "@/utils/apiUtils";
import { parseISODateTime } from "@/utils/parseTimeUtils";

// Week interface for dropdown
interface Week {
  label: string;
  value: string; // SQL date format
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState<EnrolledEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Week filtering for appointments (for member dashboard)
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());


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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Profile form state (for inline edit)
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

  // Avatar states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Check current page type
  const isCoursesPage = location.pathname.includes('/courses');
  const isEventsPage = location.pathname.includes('/events');
  const isAppointmentsPage = location.pathname.includes('/appointments');
  const isProfilePage = location.pathname.includes('/profile');
  const isSecurityPage = location.pathname.includes('/security');

  // Check if user is a consultant
  const isConsultant = user?.RoleName === 'consultant' || user?.RoleName === 'Consultant';
  const role = isConsultant ? 'consultant' : 'user';

  // Format time for appointments
  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return '';
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1];
      return timePart.substring(0, 5);
    }
    return timeString.substring(0, 5);
  }, []);

  // Week dropdown helper functions
  const formatDateOfWeek = useCallback((date: Date) => {
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
  }, []);

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
  }, [formatDateOfWeek]);

  const getCurrentWeekValue = useCallback((weeks: Week[]) => {
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
  }, []);

  // Get available years from appointments
  const getAvailableYears = useCallback(() => {
    const years = new Set(appointments.map(appointment =>
      new Date(appointment.Date).getFullYear()
    ));
    return Array.from(years).sort((a, b) => b - a);
  }, [appointments]);

  // Fetch all appointments function
  const fetchAllAppointments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để xem lịch hẹn" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointment/${role}/${user?.AccountID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data);

      setAppointments(data.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setMessage({ type: "error", text: "Không thể tải danh sách lịch hẹn" });
    }
  }, [role, user?.AccountID]);

  // Fetch appointments by week for member dashboard
  const fetchWeekAppointments = useCallback(async () => {
    if (!user?.AccountID || !selectedWeek || isConsultant) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointment/week/${user.AccountID}/${selectedWeek}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Week appointments data:', data);

      // Format time for display
      const formattedAppointments = (data.data || []).map((appointment: Appointment) => ({
        ...appointment,
        Time: formatTime(appointment.Time)
      }));

      setAppointments(formattedAppointments);
    } catch (err) {
      console.error("Error fetching week appointments:", err);
      setMessage({ type: "error", text: "Không thể tải danh sách lịch hẹn tuần này" });
      setAppointments([]);
    }
  }, [user?.AccountID, selectedWeek, isConsultant, formatTime]);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch user profile when on profile page or userId changes
  useEffect(() => {
    if (isProfilePage && userId) {
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/account/${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.data) {
              setUser(data.data);
              setProfileForm({
                username: data.data.Username || '',
                email: data.data.Email || '',
                fullName: data.data.FullName || '',
                dateOfBirth: data.data.DateOfBirth ? new Date(data.data.DateOfBirth).toISOString().split('T')[0] : '',
              });
            }
          }
        } catch (err) {
          console.error('Không thể tải thông tin hồ sơ:', err);
        }
      };
      fetchUserProfile();
    }
  }, [isProfilePage, userId, setUser, setProfileForm]);

  useEffect(() => {

  }, [userId]);


  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  // Initialize weeks and set current week for member dashboard
  useEffect(() => {
    if (!isConsultant) {
      const allWeeks = generateWeekDropdown(selectedYear);
      setWeeks(allWeeks);

      const currentWeekValue = getCurrentWeekValue(allWeeks);
      setSelectedWeek(currentWeekValue);
    }
  }, [generateWeekDropdown, selectedYear, getCurrentWeekValue, isConsultant]);

  // Fetch week appointments when week changes (for member dashboard)
  useEffect(() => {
    if (!isConsultant && selectedWeek) {
      fetchWeekAppointments();
    }
  }, [fetchWeekAppointments, isConsultant, selectedWeek]);

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

  const confirmRejectAppointment = async () => {
    if (!appointmentToReject || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await apiUtils.appointments.reject(appointmentToReject, rejectionReason.trim());
      toast.success('Đã từ chối cuộc hẹn!');

      // Refresh main appointments list
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

  // Handle profile form input changes (inline)
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
      setMessage({ type: "success", text: "Hồ sơ đã được cập nhật!" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật hồ sơ";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin" });
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/account/password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Cập nhật mật khẩu thất bại");
      }

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage({ type: "success", text: "Mật khẩu đã được cập nhật thành công!" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật mật khẩu";
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

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointment/${appointmentToCancel.AppointmentID}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      toast.success('Đã hủy cuộc hẹn thành công!');

      // Refresh appointments
      if (selectedWeek) {
        fetchWeekAppointments();
      } else {
        fetchAllAppointments();
      }

      // Close modal and reset state
      setShowCancelModal(false);
      setAppointmentToCancel(null);

    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Không thể hủy cuộc hẹn');
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    }
  };
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setConsultantDetails(null);
  };

  // Avatar functions
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using utility function
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Show crop modal
    setSelectedImageFile(file);
    setShowCropModal(true);

    // Clear the input
    event.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();

      // Create a file from the blob with proper name and type
      const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      formData.append('profilePicture', croppedFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/account/${user?.AccountID}/upload-avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Update user context
        if (user && setUser) {
          const updatedUser = { ...user, ProfilePicture: data.profilePicture };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        toast.success('Cập nhật ảnh đại diện thành công!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Không thể upload ảnh');
      }
    } catch (error: unknown) {
      console.error('Lỗi khi upload ảnh:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi upload ảnh';
      toast.error(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      if (!user?.AccountID) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/account/${user.AccountID}/remove-avatar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update user context
        if (user && setUser) {
          const updatedUser = { ...user, ProfilePicture: null };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        toast.success('Xóa ảnh đại diện thành công!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa ảnh');
      }
    } catch (error: unknown) {
      console.error('Lỗi khi xóa ảnh:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa ảnh';
      toast.error(errorMessage);
    }
  };


  // Main Dashboard Page (modified to include consultant sections)
  if (!isCoursesPage && !isEventsPage && !isAppointmentsPage && !isProfilePage && !isSecurityPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Hồ sơ {isConsultant && <span className="text-indigo-600">- Chuyên Gia Tư Vấn</span>}
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Avatar
                      src={user?.ProfilePicture}
                      name={user?.FullName}
                      size="lg"
                      className="border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      onClick={() => document.getElementById('member-avatar-upload')?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg"
                      title="Thay đổi ảnh đại diện"
                    >
                      {uploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      id="member-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                    <p className="text-gray-600">Xem thông tin tài khoản của bạn</p>
                  </div>
                </div>

                {user?.ProfilePicture && (
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) {
                        handleRemoveAvatar();
                      }
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Xóa ảnh
                  </button>
                )}
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

        {/* Image Crop Modal */}
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImageFile(null);
          }}
          onCropComplete={handleCropComplete}
          imageFile={selectedImageFile}
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
              {/* Week Filter for Member Dashboard */}
              {!isConsultant && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {getAvailableYears().map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                        {getAvailableYears().length === 0 && (
                          <option value={new Date().getFullYear()}>
                            {new Date().getFullYear()}
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Week Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tuần
                      </label>
                      <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {weeks.map((week, index) => (
                          <option key={index} value={week.value}>
                            {week.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Week Info */}
                    <div className="flex items-center">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 w-full">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Tuần hiện tại</p>
                            <p className="text-xs text-purple-600">
                              {weeks.find(week => week.value === selectedWeek)?.label || 'Chưa chọn tuần'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                                {formatDate(appointment.Date)} lúc {formatTime(appointment.Time)}
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
                                appointment.Status === 'pending' ? 'Chờ duyệt' : 'Đã bị hủy'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          {(appointment.Status === 'pending' ||
                            appointment.Status === 'confirmed')
                            && (
                              <button
                                onClick={() => {
                                  setAppointmentToCancel(appointment);
                                  setShowCancelModal(true);
                                }}
                                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                              >
                                <Calendar className="h-4 w-4" />
                                <span>Hủy hẹn</span>
                              </button>
                            )}
                          <button
                            onClick={() => handleAppointmentDetail(appointment)}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </div>

                      {appointment.Description && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm font-medium text-gray-600 mb-2">Lưu ý cho chuyên viên:</p>
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
                  <h3 className="text-2xl text-bold-800">Chưa có hẹn</h3>

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
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Xác nhận hủy cuộc hẹn
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                  Bạn có chắc chắn muốn hủy cuộc hẹn này không? Hành động này không thể hoàn tác.
                </p>

                {appointmentToCancel && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Thời gian:</span> {parseISODateTime(appointmentToCancel.Time)} - {formatDate(appointmentToCancel.Date)}
                    </p>
                    {appointmentToCancel.Description && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Mô tả:</span> {appointmentToCancel.Description}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={closeCancelModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Không
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Có, hủy cuộc hẹn
                  </button>
                </div>
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

  // Profile Page
  if (isProfilePage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                  <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
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
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa thông tin cá nhân</h2>
                  <p className="text-gray-600 text-sm">Cập nhật thông tin tài khoản của bạn</p>
                </div>
              </div>

              {/* Direct Profile Edit Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-6">
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
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
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

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Reset form to original values
                      setProfileForm({
                        username: user?.Username || "",
                        email: user?.Email || "",
                        fullName: user?.FullName || "",
                        dateOfBirth: user?.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : "",
                      });
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </button>
                </div>
              </form>
            </div>

            {/* Avatar Upload Modal */}
            {showCropModal && selectedImageFile && (
              <ImageCropModal
                isOpen={showCropModal}
                onClose={() => {
                  setShowCropModal(false);
                  setSelectedImageFile(null);
                }}
                onCropComplete={handleCropComplete}
                imageFile={selectedImageFile}
              />
            )}
          </div>
        </main>
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
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tài khoản</h1>
                  <p className="text-gray-600">Quản lý bảo mật và mật khẩu tài khoản</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex justify-between items-center ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium hover:underline">Đóng</button>
              </div>
            )}

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Lock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
                  <p className="text-gray-600 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                    <Lock className="h-4 w-4" />
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
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

        {/* Image Crop Modal for fallback */}
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImageFile(null);
          }}
          onCropComplete={handleCropComplete}
          imageFile={selectedImageFile}
        />
      </main>
    </div>
  );

};

export default DashBoardPage;