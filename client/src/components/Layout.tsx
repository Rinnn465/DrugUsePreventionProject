import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import Modal from '@/components/modal/ModalNotification';
import useModal from '@/hooks/useModal';
import { useUser } from '../context/UserContext';



const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isOpen, closeModal } = useModal();
  const { user } = useUser();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key])


  if (user && user.RoleName === 'Admin') {
    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/roles');
    if (!isAdminRoute) {
      return <Navigate to="/admin" replace />;
    }
    return (
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    );
  }

  // Redirect Manager to manager panel if they try to access other routes
  if (user && user.RoleName === 'Manager') {
    const isManagerRoute = location.pathname.startsWith('/manager') || location.pathname.startsWith('/roles');
    if (!isManagerRoute) {
      return <Navigate to="/manager" replace />;
    }
    return (
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    );
  }

  // Redirect Staff to staff panel if they try to access other routes  
  if (user && user.RoleName === 'Staff') {
    const isStaffRoute = location.pathname.startsWith('/staff') || location.pathname.startsWith('/roles');
    if (!isStaffRoute) {
      return <Navigate to="/staff" replace />;
    }
    return (
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleMobileMenu={toggleMobileMenu} />
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Thông báo"
        description="Phiên đăng nhập đã hết, vui lòng đăng nhập lại để có thể sử dụng nhiều dịch vụ hơn"
        confirmMessage="Đăng nhập ngay"
        confirmUrl={() => {
          window.location.href = '/login';
        }}
      />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;