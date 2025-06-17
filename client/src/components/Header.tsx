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
  LogOut 
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
  let { user, setUser } = useUser();

  useEffect(() => {
    tippy('[data-tippy-content]');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-w-[160px]">
          <span className="inline-block h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-600" />
          </span>
          <span className="font-bold text-xl text-primary-700 tracking-wide">DrugPrevention</span>
        </Link>

        {/* Menu điều hướng dạng card */}
        <nav className="flex-1 flex justify-center">
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
            {navMenus.map((item, idx) => {
              return (
                <NavLink
                  to={item.to}
                  key={idx}
                  className={({ isActive }) =>
                    `flex items-center justify-center bg-white rounded-xl shadow-md px-4 py-2 min-w-[120px] max-w-[160px] hover:shadow-lg transition group border border-transparent hover:border-primary-200 text-center whitespace-nowrap select-none ${isActive ? 'border-primary-500 shadow-lg text-primary-700 font-semibold' : 'text-gray-700'} hover:text-primary-700`
                  }
                  style={{ minHeight: 60 }}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User/account */}
        <div className="min-w-[120px] flex justify-end">
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
                <span className='select-none text-black-500 font-semibold'>{user.Username}</span>
              </div>
            </Tippy>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-block bg-white text-primary-600 px-4 py-2 rounded-md shadow hover:bg-gray-100 transition-colors font-medium border border-primary-100"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md shadow hover:bg-primary-700 transition-colors font-medium border border-primary-100"
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