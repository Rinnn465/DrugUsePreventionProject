import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { courseData } from "../data/courseData";
import { User, BookOpen, Calendar, Clock, Users, Phone, Mail, MapPin, Edit, ArrowRight, Lock } from "lucide-react";
import { Appointment } from "../types/Appointment";

interface ProfileFormData {
  username: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DashBoardPage: React.FC = () => {
  const { userId } = useParams();
  const { user, setUser } = useUser();
  const location = useLocation();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
  const isProfilePage = location.pathname.includes('/profile');
  const isCoursesPage = location.pathname.includes('/courses');
  const isEventsPage = location.pathname.includes('/events');
  const isAppointmentsPage = location.pathname.includes('/appointments');
  const isSecurityPage = location.pathname.includes('/security');

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

  // Handle profile form input changes
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Handle password form input changes
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Simple email validation
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    // Check if data has changed
    if (
      profileForm.username === user?.Username &&
      profileForm.email === user?.Email &&
      profileForm.fullName === user?.FullName &&
      profileForm.dateOfBirth === (user?.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : "")
    ) {
      setMessage({ type: "success", text: "Không có thay đổi để lưu" });
      setIsEditingProfile(false);
      setIsLoading(false);
      return;
    }

    // Client-side validation
    if (!profileForm.username || profileForm.username.length < 3 || profileForm.username.length > 50) {
      setMessage({ type: "error", text: "Tên người dùng phải từ 3 đến 50 ký tự" });
      setIsLoading(false);
      return;
    }
    if (!isValidUsername(profileForm.username)) {
      setMessage({ type: "error", text: "Tên người dùng chỉ được chứa chữ cái và số" });
      setIsLoading(false);
      return;
    }
    if (!profileForm.email || !isValidEmail(profileForm.email)) {
      setMessage({ type: "error", text: "Email không hợp lệ" });
      setIsLoading(false);
      return;
    }
    if (!profileForm.fullName || profileForm.fullName.length < 2 || profileForm.fullName.length > 100) {
      setMessage({ type: "error", text: "Họ tên phải từ 2 đến 100 ký tự" });
      setIsLoading(false);
      return;
    }
    if (profileForm.dateOfBirth && new Date(profileForm.dateOfBirth) > new Date()) {
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
        body: JSON.stringify(profileForm),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Cập nhật hồ sơ thất bại");
      }

      setUser(result.user); // Update user context
      setIsEditingProfile(false);
      setMessage({ type: "success", text: "Hồ sơ đã được cập nhật!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đã xảy ra lỗi khi cập nhật hồ sơ" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

    // Client-side validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ các trường mật khẩu" });
      setIsLoading(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
      setIsLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/account/password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Cập nhật mật khẩu thất bại");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
      setMessage({ type: "success", text: "Mật khẩu đã được cập nhật!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đã xảy ra lỗi khi cập nhật mật khẩu" });
    } finally {
      setIsLoading(false);
    }
  };

  // Profile Page
  if (isProfilePage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium">Đóng</button>
              </div>
            )}

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
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{user?.Username}</h2>
                  <p className="text-gray-600 text-sm">Thành viên từ {parseDate(`${user?.CreatedAt}`)}</p>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-800">{user?.Email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-800">Chưa cập nhật</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Địa chỉ</p>
                        <p className="font-medium text-gray-800">Chưa cập nhật</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Khóa học hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Sự kiện tham gia</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cuộc hẹn</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Hoạt động gần đây</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có hoạt động nào</p>
              </div>
            </div>
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Bảo mật</h1>
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message.text}
                <button onClick={() => setMessage(null)} className="text-sm font-medium">Đóng</button>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
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
                  {isLoading ? "Đang lưu..." : "Cập nhật mật khẩu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setMessage(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Courses Page
  if (isCoursesPage) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Khóa học đã tham gia</h1>
                  <p className="text-gray-600">Quản lý các khóa học bạn đã đăng ký</p>
                </div>
              </div>
              <Link
                to="/courses"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <span>Khám phá thêm</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Đang học</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Hoàn thành</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-gray-600">Tạm dừng</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">0</p>
                <p className="text-sm text-gray-600">Tổng cộng</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Danh sách khóa học</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có khóa học nào</h3>
                <p className="text-gray-600 mb-4">Bạn chưa tham gia khóa học nào. Hãy khám phá và đăng ký ngay!</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Khám phá khóa học
                </Link>
              </div>
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Sự kiện đã tham gia</h1>
                  <p className="text-gray-600">Quản lý các sự kiện bạn đã tham gia</p>
                </div>
              </div>
              <Link
                to="/community-programs"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <span>Khám phá thêm</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Sắp tới</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Đã tham gia</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-gray-600">Đã hủy</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">0</p>
                <p className="text-sm text-gray-600">Tổng cộng</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Danh sách sự kiện</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có sự kiện nào</h3>
                <p className="text-gray-600 mb-4">Bạn chưa tham gia sự kiện nào. Hãy khám phá và đăng ký ngay!</p>
                <Link
                  to="/community-programs"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Khám phá sự kiện
                </Link>
              </div>
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn của tôi</h1>
                  <p className="text-gray-600">Quản lý các cuộc hẹn tư vấn của bạn</p>
                </div>
              </div>
              <Link
                to="/appointments"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <span>Đặt lịch mới</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{appointments.length}</p>
                <p className="text-sm text-gray-600">Tổng cộng</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Sắp tới</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Hoàn thành</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">0</p>
                <p className="text-sm text-gray-600">Đã hủy</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Lịch sử cuộc hẹn</h2>
            </div>
            <div className="p-6">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.AppointmentID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div>
                        <p className="font-medium text-gray-800">Cuộc hẹn #{appointment.AppointmentID}</p>
                        <p className="text-sm text-gray-600">Ngày: {parseDate(appointment.Date)}</p>
                      </div>
                      <Link
                        to={`/appointments/${appointment.AppointmentID}`}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có lịch hẹn nào</h3>
                  <p className="text-gray-600 mb-4">Bạn chưa có lịch hẹn tư vấn nào. Hãy đặt lịch ngay!</p>
                  <Link
                    to="/appointments"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Đặt lịch hẹn ngay
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main Dashboard Page
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Xin chào, {user?.Username}
                </h1>
                <p className="text-gray-600 mt-1">
                  Chào mừng bạn quay trở lại với hệ thống
                </p>
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span>{user?.Email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Tham gia: {parseDate(`${user?.CreatedAt}`)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to={`/dashboard/${userId}/courses`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Khóa học tham gia</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{courseData.length}</p>
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
          <Link to={`/dashboard/${userId}/appointments`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lịch hẹn</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Khóa học gần đây</h2>
                </div>
                <Link
                  to={`/dashboard/${userId}/courses`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Chưa có khóa học nào</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Khám phá khóa học
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Sự kiện gần đây</h2>
                </div>
                <Link
                  to={`/dashboard/${userId}/events`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Chưa có sự kiện nào</p>
                <Link
                  to="/community-programs"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Khám phá sự kiện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashBoardPage;