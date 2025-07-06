import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, Users, Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useUser();

  // Extract userId from current path
  const pathSegments = location.pathname.split('/');
  const userId = pathSegments[2]; // Assuming path format is /dashboard/{userId}

  let menuItems = [
    { path: userId ? `/dashboard/${userId}` : '/', label: 'Dashboard', icon: Home },
    { path: userId ? `/dashboard/${userId}/security` : '#', label: 'Bảo mật', icon: Lock },
    { path: userId ? `/dashboard/${userId}/courses` : '#', label: 'Khóa học', icon: BookOpen },
    { path: userId ? `/dashboard/${userId}/events` : '#', label: 'Chương trình', icon: Users },
    { path: userId ? `/dashboard/${userId}/appointments` : '#', label: 'Lịch hẹn', icon: Calendar },
  ];


  if (user?.RoleName.toLowerCase() === 'consultant') {
    menuItems = menuItems.slice(0, menuItems.length - 1);
  }

  const isActiveRoute = (itemPath: string) => {
    // Special handling for security route
    if (itemPath.includes('/security')) {
      return location.pathname.includes('/security');
    }
    // Special handling for courses route
    if (itemPath.includes('/courses')) {
      return location.pathname.includes('/courses');
    }
    // Special handling for events route
    if (itemPath.includes('/events')) {
      return location.pathname.includes('/events');
    }
    // Special handling for appointments route
    if (itemPath.includes('/appointments')) {
      return location.pathname.includes('/appointments');
    }
    // For dashboard main page
    if (
      itemPath.includes('/dashboard') &&
      !itemPath.includes('/security') &&
      !itemPath.includes('/courses') &&
      !itemPath.includes('/events') &&
      !itemPath.includes('/appointments')
    ) {
      return (
        location.pathname.includes('/dashboard') &&
        !location.pathname.includes('/security') &&
        !location.pathname.includes('/courses') &&
        !location.pathname.includes('/events') &&
        !location.pathname.includes('/appointments')
      );
    }
    // For other routes
    return location.pathname === itemPath;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;