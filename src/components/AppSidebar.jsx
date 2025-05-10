// src/components/AppSidebar.jsx
import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import logoConcurso from '../assets/images/logo-gulbenkian.png'; // Adjust path if needed
import '../styles/AppSidebar.css'; // Import the new CSS file

export default function AppSidebar({ collapsed, toggled, onClose, setBroken }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location to set active state

  const handleNavigate = (path) => {
    navigate(path);
    if (toggled) {
      onClose();
    }
  };

  return (
    <Sidebar
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={onClose}
      onBreakPoint={setBroken}
      breakPoint="md"
      backgroundColor="hsl(210, 15%, 98%)" // Can still set base color here or in CSS
      style={{
          height: '100vh',
          position: 'fixed', // This is key for it staying in place
          zIndex: 1000,
          borderRight: '1px solid hsl(210, 15%, 90%)',
      }}
      width="230px" // Make it smaller
      collapsedWidth="65px" // Make collapsed smaller
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Menu> {/* Removed menuItemStyles prop, will use AppSidebar.css */}
          <div className="sidebar-header">
            <img src={logoConcurso} alt="Logo Concurso" className="sidebar-logo" />
            <span className="sidebar-title">Concurso Violino</span>
          </div>

          <MenuItem
            component={<Link to="/" />}
            active={location.pathname === "/"} // Set active based on current path
            onClick={() => handleNavigate('/')}
          >
            Página Principal
          </MenuItem>

          <SubMenu
            label="V Concurso Interno Violino"
            // Determine if submenu should be initially open based on current path
            defaultOpen={['/regulamento', '/inscricao', '/juri', '/resultados'].includes(location.pathname)}
          >
            <MenuItem component={<Link to="/regulamento" />} active={location.pathname === "/regulamento"} onClick={() => handleNavigate('/regulamento')}>Regulamento</MenuItem>
            <MenuItem component={<Link to="/inscricao" />} active={location.pathname === "/inscricao"} onClick={() => handleNavigate('/inscricao')}>Inscrições</MenuItem>
            <MenuItem component={<Link to="/juri" />} active={location.pathname === "/juri"} onClick={() => handleNavigate('/juri')}>Júri</MenuItem>
            <MenuItem component={<Link to="/resultados" />} active={location.pathname === "/resultados"} onClick={() => handleNavigate('/resultados')}>Premiados</MenuItem>
          </SubMenu>

          <SubMenu
            label="Área Reservada"
            defaultOpen={location.pathname === "/jurylogin"}
          >
            <MenuItem component={<Link to="/jurylogin" />} active={location.pathname === "/jurylogin"} onClick={() => handleNavigate('/jurylogin')}>Login Júri</MenuItem>
          </SubMenu>

          <MenuItem
            component={<Link to="/participantes" />}
            active={location.pathname === "/participantes"}
            onClick={() => handleNavigate('/participantes')}
          >
            Participantes (Ed. V)
          </MenuItem>
        </Menu>

        <div className="sidebar-footer">
          <small>© {new Date().getFullYear()} Concurso Violino</small>
        </div>
      </div>
    </Sidebar>
  );
}