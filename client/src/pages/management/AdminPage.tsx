import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { 
    Home,
    Users, 
    BookOpen, 
    Calendar, 
    BarChart3, 
    Shield,
    TrendingUp,
    FileText,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Bell,
    Search
} from "lucide-react";

const AdminPage: React.FC = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Sidebar navigation items - chỉ những link thật sự hoạt động
    const navigationItems = [
        {
            label: "Bảng điều khiển",
            icon: Home,
            active: true,
            link: `/admin`
        },
        {
            label: "Quản lý khóa học",
            icon: BookOpen,
            link: `/roles/${user?.RoleID}/course-manage`
        },
        {
            label: "Quản lý chương trình", 
            icon: Calendar,
            link: `/roles/${user?.RoleID}/program-manage`
        }
    ];


    
    // Stats thực tế với ý nghĩa (dữ liệu động từ API)
    const [statsData, setStatsData] = useState([
        {
            title: "Tổng người dùng",
            value: "-",
            change: "",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "Tổng lượt đăng ký khóa học",
            value: "-",
            change: "",
            icon: BookOpen,
            color: "bg-green-500"
        },
        {
            title: "Tổng lượt tham gia chương trình",
            value: "-",
            change: "",
            icon: Calendar,
            color: "bg-purple-500"
        },
        {
            title: "Tỷ lệ hoàn thành khóa học",
            value: "-",
            change: "",
            icon: TrendingUp,
            color: "bg-orange-500"
        }
    ]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = localStorage.getItem("token");
                const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
                // Gọi các API thống kê
                const [userRes, courseEnrollRes, programEnrollRes, courseCompletionRes] = await Promise.all([
                    fetch("http://localhost:5000/api/account/statistics/count", { headers }),
                    fetch("http://localhost:5000/api/course/statistics/total-enrollment", { headers }),
                    fetch("http://localhost:5000/api/program-attendee/statistics/enroll", { headers }),
                    fetch("http://localhost:5000/api/course/statistics/total-completion-rate", { headers })
                ]);
                const userData = await userRes.json();
                const courseEnrollData = await courseEnrollRes.json();
                const programEnrollData = await programEnrollRes.json();
                const courseCompletionData = await courseCompletionRes.json();

                setStatsData([
                    {
                        title: "Tổng người dùng",
                        value: userData.total || "-",
                        change: "+0%",
                        icon: Users,
                        color: "bg-blue-500"
                    },
                    {
                        title: "Tổng lượt đăng ký khóa học",
                        value: courseEnrollData.totalEnrollment || "-",
                        change: "+0%",
                        icon: BookOpen,
                        color: "bg-green-500"
                    },
                    {
                        title: "Tổng lượt tham gia chương trình",
                        value: programEnrollData.data ? programEnrollData.data.reduce((sum: number, p: any) => sum + (p.EnrollCount || 0), 0) : "-",
                        change: "+0%",
                        icon: Calendar,
                        color: "bg-purple-500"
                    },
                    {
                        title: "Tỷ lệ hoàn thành khóa học",
                        value: courseCompletionData.completionRate ? `${(courseCompletionData.completionRate * 100).toFixed(2)}%` : "-",
                        change: "+0%",
                        icon: TrendingUp,
                        color: "bg-orange-500"
                    }
                ]);
            } catch (error) {
                // Nếu lỗi, giữ nguyên stats mặc định
            }
        }
        fetchStats();
    }, []);

    const handleLogout = () => {
        fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        })
            .then(() => {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.clear();
                navigate('/login');
            })
            .catch(() => {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.clear();
                navigate('/login');
            });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-8 w-8 text-blue-400" />
                        <span className="text-xl font-bold text-white">ADMIN</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Điều hướng
                    </div>
                    
                    {navigationItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.link}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                item.active ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ))}

                    {/* Logout Button */}
                    <div className="mt-8 px-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.FullName?.charAt(0) || user?.Username?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.FullName || user?.Username || 'Quản trị viên'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                            <p className="text-gray-600">Xin chào {user?.FullName || user?.Username || 'Quản trị viên'}, hôm nay bạn muốn làm gì?</p>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statsData.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                            <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                            <div className="flex items-center">
                                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                                <span className="text-sm text-gray-500 ml-1">từ tháng trước</span>
                                            </div>  
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.color}`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions - Thực tế có thể click */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                                Thao tác nhanh
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link
                                    to={`/roles/${user?.RoleID}/program-manage`}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <div className="text-center">
                                        <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Thêm chương trình</span>
                                    </div>
                                </Link>
                                <Link
                                    to={`/roles/${user?.RoleID}/course-manage`}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <div className="text-center">
                                        <BookOpen className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Thêm khóa học</span>
                                    </div>
                                </Link>
                                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                                    <div className="text-center">
                                        <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">Tạo báo cáo</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminPage;