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
  const { isOpen, closeModal } = useModal();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key])


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