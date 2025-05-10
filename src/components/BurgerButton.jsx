// src/components/BurgerButton.jsx
import React from 'react';
import '../styles/MainLayout.css'; // Assuming burger styles will go here now

export default function BurgerButton({ onClick, isOpen }) {
  // This button is typically only visible and functional on mobile (when sidebar is "broken")
  return (
    <button
      className={`burger-button-pro-sidebar ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      aria-expanded={isOpen}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}