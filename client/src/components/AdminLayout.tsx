import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Avatar from "./common/Avatar";
import { 
    Home,
    BookOpen, 
    Calendar, 
    Shield,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Users,
    FileText,
    Settings,
    KeyRound,
    ChevronDown
} from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Sidebar navigation items - phân biệt theo role
    const navigationItems = [
        {
            label: "Bảng điều khiển",
            icon: Home,
            link: user?.RoleName === 'Staff' ? '/staff' : 
                  user?.RoleName === 'Manager' ? '/manager' : '/admin',
            isActive: (user?.RoleName === 'Staff' && location.pathname === '/staff') || 
                     (user?.RoleName === 'Admin' && location.pathname === '/admin') ||
                     (user?.RoleName === 'Manager' && location.pathname === '/manager')
        },
        // Chỉ hiển thị cho Staff
        ...(user?.RoleName === 'Staff' ? [
            {
                label: "Quản lý bài viết",
                icon: FileText,
                link: `/roles/${user?.RoleID}/article-manage`,
                isActive: location.pathname.includes('/article-manage')
            },
            {
                label: "Quản lý chương trình cộng đồng", 
                icon: Calendar,
                link: `/roles/${user?.RoleID}/program-manage`,
                isActive: location.pathname.includes('/program-manage')
            }
        ] : []),
        // Menu cho Manager
        ...(user?.RoleName === 'Manager' ? [
            {
                label: "Quản lý chương trình",
                icon: Calendar,
                link: `/roles/${user?.RoleID}/program-manage`,
                isActive: location.pathname.includes('/program-manage')
            },
            {
                label: "Báo cáo & Phân tích",
                icon: FileText,
                link: `/roles/${user?.RoleID}/reports`,
                isActive: location.pathname.includes('/reports')
            }
        ] : []),
        // Hiển thị đầy đủ cho Admin
        ...(user?.RoleName === 'Admin' ? [
            {
                label: "Quản lý khóa học",
                icon: BookOpen,
                link: `/roles/${user?.RoleID}/course-manage`,
                isActive: location.pathname.includes('/course-manage')
            },
            {
                label: "Quản lý chương trình", 
                icon: Calendar,
                link: `/roles/${user?.RoleID}/program-manage`,
                isActive: location.pathname.includes('/program-manage')
            },
            {
                label: "Quản lý tài khoản",
                icon: Users,
                link: `/roles/${user?.RoleID}/account-manage`,
                isActive: location.pathname.includes('/account-manage')
            },
            {
                label: "Quản lý bài viết",
                icon: FileText,
                link: `/roles/${user?.RoleID}/article-manage`,
                isActive: location.pathname.includes('/article-manage')
            }
        ] : [])
    ];

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.profile-dropdown')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-8 w-8 text-blue-400" />
                        <span className="text-xl font-bold text-white">{user?.RoleName?.toUpperCase() || 'ADMIN'}</span>
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
                    {/* Profile Section */}
                    <div className="mb-6 profile-dropdown">
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                            >
                                <Avatar
                                    src={user?.ProfilePicture}
                                    name={user?.FullName}
                                    size="md"
                                />
                                <div className="flex-1 text-left">
                                    <div className="text-white font-medium text-sm">{user?.FullName || user?.Username}</div>
                                    <div className="text-gray-400 text-xs">{user?.RoleName}</div>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                                    <Link
                                        to={`/roles/${user?.RoleID}/admin-profile`}
                                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span className="text-sm">Chỉnh sửa hồ sơ</span>
                                    </Link>
                                    <Link
                                        to={`/roles/${user?.RoleID}/change-password`}
                                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        <span className="text-sm">Chỉnh sửa tài khoản</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Điều hướng
                    </div>
                    
                    {navigationItems.map((item) => (
                        <Link
                            key={item.link}
                            to={item.link}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                item.isActive ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'
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
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <button 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden border-0 p-0 cursor-pointer"
                    onClick={() => setSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setSidebarOpen(false);
                        }
                    }}
                    aria-label="Đóng sidebar"
                />
            )}
        </div>
    );
};

export default AdminLayout; 