import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';
import { useUser } from '../context/UserContext';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
  Info,
  Newspaper,
  BookOpen,
  ClipboardList,
  Calendar,
  Users,
  Heart,
  User,
  LogOut,
  Settings
} from 'lucide-react';

const navMenus = [
  {
    to: '/about',
    label: 'Giới thiệu',
    icon: Info,
  },
  {
    to: '/article',
    label: 'Blog',
    icon: Newspaper,
  },
  {
    to: '/courses',
    label: 'Khóa học',
    icon: BookOpen,
  },
  {
    to: '/assessments',
    label: 'Trắc nghiệm đánh giá',
    icon: ClipboardList,
  },
  {
    to: '/appointments',
    label: 'Đặt lịch trực tuyến',
    icon: Calendar,
  },
  {
    to: '/community-programs',
    label: 'Cộng đồng',
    icon: Users,
  },
];

type HeaderProps = {
  toggleMobileMenu?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, setUser } = useUser();

  useEffect(() => {
    tippy('[data-tippy-content]');
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.clear();
          window.location.href = '/login';
        } else {
          console.error('Logout failed');
        }
      })
      .catch(err => console.error('Error:', err));
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Góc trái */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-block h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-600" />
          </span>
          <span className="font-bold text-2xl text-primary-700 tracking-wide">DrugPrevention</span>
        </Link>

        {/* Menu điều hướng - Giữa */}
        <nav className="hidden lg:flex justify-center flex-1 px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin">
            {navMenus.map((item, idx) => {
              return (
                <NavLink
                  to={item.to}
                  key={idx}
                  className={({ isActive }) =>
                    `flex items-center justify-center bg-white rounded-lg shadow-sm px-3 py-2 min-w-[100px] hover:shadow-md transition-all group border border-transparent hover:border-primary-200 text-center whitespace-nowrap select-none ${isActive ? 'border-primary-500 shadow-md text-primary-700 font-semibold' : 'text-gray-700'} hover:text-primary-700`
                  }
                  style={{ minHeight: 45 }}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User/account - Góc phải */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <Tippy
              interactive
              render={(attrs) => (
                <div className='bg-white shadow-lg rounded-md p-4' tabIndex={-1} {...attrs}>
                  <div className="flex flex-col gap-2">
                    <Link to={`/dashboard/${user?.AccountID}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    {user.RoleName === 'Admin' && (
                      <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {user.RoleName === 'Manager' && (
                      <Link to="/roles/manager" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Manager Panel</span>
                      </Link>
                    )}
                    {user.RoleName === 'Staff' && (
                      <Link to="/roles/staff" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Staff Panel</span>
                      </Link>
                    )}
                    {user.RoleName === 'Consultant' && (
                      <Link to="/consultant" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Consultant Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                      <LogOut className="h-5 w-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            >
              <div className='flex gap-2 items-center cursor-pointer'>
                <User className="h-8 w-8 text-primary-600" />
                <span className='select-none text-gray-700 font-semibold text-base'>{user.Username}</span>
              </div>
            </Tippy>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-white text-primary-600 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-300 font-semibold border border-primary-200 text-base whitespace-nowrap"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-700 hover:shadow-md transition-all duration-300 font-semibold text-base whitespace-nowrap"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;