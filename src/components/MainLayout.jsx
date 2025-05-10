// src/components/MainLayout.jsx
import React, { useState, useEffect } from 'react'; // useEffect can be useful for body class
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import BurgerButton from './BurgerButton';
import '../styles/MainLayout.css';

export default function MainLayout() {
  const [sidebarDesktopCollapsed, setSidebarDesktopCollapsed] = useState(false); // For desktop: true = collapsed, false = expanded
  const [sidebarMobileToggled, setSidebarMobileToggled] = useState(false);     // For mobile: true = overlay shown, false = overlay hidden
  const [isMobileView, setIsMobileView] = useState(false); // Set by AppSidebar's onBreakPoint

  const handleToggleSidebar = () => {
    if (isMobileView) {
      setSidebarMobileToggled(!sidebarMobileToggled);
    } else {
      setSidebarDesktopCollapsed(!sidebarDesktopCollapsed);
    }
  };

  // Optional: Add/remove a class to body when mobile sidebar is open to prevent body scroll
  useEffect(() => {
    if (isMobileView && sidebarMobileToggled) {
      document.body.classList.add('sidebar-mobile-open');
    } else {
      document.body.classList.remove('sidebar-mobile-open');
    }
    // Cleanup function
    return () => {
      document.body.classList.remove('sidebar-mobile-open');
    };
  }, [isMobileView, sidebarMobileToggled]);


  return (
    <div className="site-container-pro-sidebar"> {/* This div wraps everything */}
      <AppSidebar
        collapsed={sidebarDesktopCollapsed && !isMobileView} // Only apply desktop collapse if not mobile
        toggled={sidebarMobileToggled && isMobileView}     // Only toggle overlay if mobile
        onClose={() => setSidebarMobileToggled(false)}     // Closes mobile overlay (e.g., on backdrop click)
        setBroken={setIsMobileView}                        // AppSidebar tells us if it's mobile view (breakpoint)
      />

      {/* Burger button is only rendered AND functional on mobile */}
      {isMobileView && (
        <div className="burger-button-container">
          <BurgerButton onClick={handleToggleSidebar} isOpen={sidebarMobileToggled} />
        </div>
      )}

      <main className="content-wrap-pro-sidebar">
        <Outlet />
      </main>
    </div>
  );
}