// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import BurgerButton from './BurgerButton';
import '../styles/MainLayout.css';

export default function MainLayout() {
  const [sidebarToggled, setSidebarToggled] = useState(false); // For mobile overlay state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop collapsed state
  const [isMobile, setIsMobile] = useState(false); // To know if we are in "broken" mode

  const handleToggleSidebar = () => {
      if (isMobileView) {
        setSidebarToggled(!sidebarToggled); // This controls the overlay on mobile
      } else {
        setSidebarCollapsed(!sidebarCollapsed); // This controls desktop collapse/expand
      }
    };

  const handleCloseMobileSidebar = () => {
    setSidebarToggled(false);
  };

  return (
    // The outer div for react-pro-sidebar is often just the <body> or a direct child like #root
    // The <Sidebar> itself will be position:fixed.
    // This .site-container-pro-sidebar is more for our content management.
    <div className={`site-container-pro-sidebar`}>
      <AppSidebar
        collapsed={sidebarCollapsed} // For desktop collapse
        toggled={sidebarToggled} // For mobile overlay toggle
        onClose={handleCloseMobileSidebar} // To close mobile overlay
        setBroken={setIsMobile} // react-pro-sidebar tells us if it's "broken"
      />
      {/* Burger button container is now part of the general flow or AppSidebar handles it */}
      {isMobile && ( // Only show burger on mobile
        <div className="burger-button-container">
            <BurgerButton onClick={handleToggleSidebar} isOpen={sidebarToggled} />
        </div>
      )}
      <main className="content-wrap-pro-sidebar">
        <Outlet />
      </main>
    </div>
  );
}