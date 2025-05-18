import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, X, User } from 'lucide-react';

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {

  let user = false;
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary-600" />
          <span className="font-bold text-xl text-gray-900">DrugPrevention</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Giới thiệu
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Blog
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Khóa học
          </NavLink>
          <NavLink
            to="/assessments"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Trắc ngiệm đánh giá
          </NavLink>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Đặt lịch trực tuyến
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600 transition-colors"
            }
          >
            Sự kiện
          </NavLink>
        </nav>

        {user ? <div className="flex items-center gap-4">
          <Link to="/profile" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div> :

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-block bg-white text-primary-600 px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>}
      </div>
    </header>
  );
};

export default Header;