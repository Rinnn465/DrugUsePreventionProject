import React, { createContext, useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import { userData } from '../data/userData';
import { User } from '../types/User';

export const UserContext = createContext<User | null>(null);

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key])

  return (
    <UserContext.Provider value={userData[5]}>
      <div className="flex flex-col min-h-screen">
        <Header toggleMobileMenu={toggleMobileMenu} />
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserContext.Provider>
  );
};

export default Layout;