// src/components/JuryLayout.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Navbar from './Navbar'; // The jury's specific navbar

export default function JuryLayout() {
  const [user, loadingAuth] = useAuthState(auth);

  if (loadingAuth) {
    // You can return a loading spinner or a minimal layout
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Verificando autenticação...</p>
        </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to the jury login page
    return <Navigate to="/jurylogin" replace />;
  }

  // If authenticated, render the Navbar and the specific jury page content
  return (
    <div className="jury-layout-container"> {/* Add a class for potential overall styling */}
      <Navbar user={user} /> {/* Pass user to Navbar */}
      <div className="jury-page-content-wrapper"> {/* Wrapper for padding, etc. */}
        <Outlet /> {/* Renders the nested route's component (JuryDashboardPage or JuryFinalScoresPage) */}
      </div>
    </div>
  );
}