// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as necessary

// Import your logos (adjust paths as needed)
import logoGulbenkian from "../assets/images/logo-gulbenkian.png";
import logoRepublica from "../assets/images/logo-republica-portuguesa.png";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Navigate to login page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleGoToFinalScores = () => {
    navigate("/final-scores"); // Adjust route as needed
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logoGulbenkian} alt="Calouste Gulbenkian Logo" className="navbar-logo" />
        <img src={logoRepublica} alt="República Portuguesa Logo" className="navbar-logo" />
      </div>
      {user && (
        <div className="navbar-user-info">
          <span className="navbar-email">Júri: {user.email}</span>
          <button onClick={handleGoToFinalScores} className="navbar-button">
            Resultados Finais
          </button>
          <button onClick={handleLogout} className="navbar-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}