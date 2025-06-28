import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import Modal from '@/components/modal/ModalNotification';
import useModal from '@/hooks/useModal';


const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isOpen, openModal, closeModal } = useModal();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to check if JWT token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      // Decode the JWT payload (middle part of the token)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000; // Convert to seconds
      return payload.exp < currentTime; // Check if expiration time is past
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // If we can't parse the token, consider it expired
    }
  };

  // Function to clear all authentication data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

  };

  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key])

  useEffect(() => {
    if (!token) {
      openModal();
    } else if (isTokenExpired(token)) {
      clearAuthData();
      openModal();
    }
  }, [token, openModal])

  // Periodic check for token expiration every 30 seconds
  useEffect(() => {
    const checkTokenExpiration = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        console.log('JWT token has expired during periodic check, clearing localStorage');
        clearAuthData();
        openModal();
      }
    };

    // Check immediately and then every 30 seconds
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 30000);

    return () => clearInterval(interval);
  }, [openModal])

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