import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X, Heart, User, BarChart3, Users } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <Heart className="h-8 w-8 text-primary-600" />
          <span className="font-bold text-xl text-gray-900">DrugPrevention</span>
        </Link>
        <button 
          className="text-gray-700 focus:outline-none"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Home
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          About
        </NavLink>
        <NavLink 
          to="/blog" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Blog
        </NavLink>
        <NavLink 
          to="/courses" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Courses
        </NavLink>
        <NavLink 
          to="/assessments" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Assessments
        </NavLink>
        <NavLink 
          to="/appointments" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Appointments
        </NavLink>
        <NavLink 
          to="/programs" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Programs
        </NavLink>
        <NavLink 
          to="/counselors" 
          className={({ isActive }) => 
            `text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
          }
          onClick={onClose}
        >
          Counselors
        </NavLink>
        <div className="pt-4 border-t border-gray-200">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex items-center gap-3 text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
            }
            onClick={onClose}
          >
            <User className="h-5 w-5" />
            Profile
          </NavLink>
        </div>
        <div className="pt-4">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center gap-3 text-xl ${isActive ? "text-primary-600 font-medium" : "text-gray-700"}`
            }
            onClick={onClose}
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;