import { Link, useLocation } from "react-router-dom"
import { Home, User, BookOpen, Calendar, Users, Settings } from "lucide-react"

const Sidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { path: '/', label: 'Trang chủ', icon: Home },
        { path: '#', label: 'Hồ sơ', icon: User },
        { path: '/courses', label: 'Khóa học', icon: BookOpen },
        { path: '/community-programs', label: 'Sự kiện', icon: Users },
        { path: '/appointments', label: 'Đặt lịch hẹn', icon: Calendar },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">Bảng điều khiển</p>
            </div>
            
            {/* Navigation */}
            <nav className="flex-grow p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500">
                    <Settings className="h-4 w-4" />
                    <span>Phiên bản 1.0.0</span>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar