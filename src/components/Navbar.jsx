// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as necessary

// Import your logos (adjust paths as needed)
import logoGulbenkian from "../assets/images/logo-gulbenkian.png";
import logoRepublica from "../assets/images/logo-republica-portuguesa.png";
import logo from "../assets/images/logo2025.png"; // Assuming you have a logo.png

import "../styles/Navbar.css"; // Adjust path as necessary

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleGoToParticipants = () => {
    navigate("/avaliar"); // This is the route for JuryDashboard
  };

  const handleGoToFinalScores = () => {
    navigate("/resultados-juri");
  };

  // Determine if the "Participantes" button should be active or prominent
  // This is optional, but can improve UX
  const isParticipantsPageActive = location.pathname === "/avaliar";
  const isFinalScoresPageActive = location.pathname === "/resultados-juri";


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logoGulbenkian} alt="Calouste Gulbenkian Logo" className="navbar-logo-cmacg" />
        <img src={logoRepublica} alt="República Portuguesa Logo" className="navbar-logo" />
        <img src={logo} alt="Logo" className="navbar-logo2025" />
      </div>
      {user && (
        <div className="navbar-user-info">
          <span className="navbar-email">Júri: {user.email}</span>
          {/* Conditionally render or style based on current page */}
          {!isParticipantsPageActive && ( // Only show if not already on participants page
            <button onClick={handleGoToParticipants} className="navbar-button">
              Participantes
            </button>
          )}
          {/* OR always show and style differently:
          <button
            onClick={handleGoToParticipants}
            className={`navbar-button ${isParticipantsPageActive ? 'navbar-button-active' : ''}`}
          >
            Participantes
          </button>
          */}

          {!isFinalScoresPageActive && ( // Only show if not already on final scores page
            <button onClick={handleGoToFinalScores} className="navbar-button">
              Resultados Finais
            </button>
          )}
          {/* OR always show and style differently:
          <button
            onClick={handleGoToFinalScores}
            className={`navbar-button ${isFinalScoresPageActive ? 'navbar-button-active' : ''}`}
          >
            Resultados Finais
          </button>
          */}

          <button onClick={handleLogout} className="navbar-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}