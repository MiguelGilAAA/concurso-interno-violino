// src/pages/JuryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Adjust path

import Navbar from '../components/Navbar'; // Adjust path
import ParticipantInfoPanel from '../components/ParticipantInfoPanel'; // Adjust path
import ScoringPanel from '../components/ScoringPanel'; // Adjust path

import '../styles/JuryDashboard.css'; // Import the new CSS

// Mock data - in a real app, fetch this
const mockParticipants = [
  { id: 'p1', nome: 'Ana Beatriz Silva', categoria: 'Iniciante', fotoUrl: 'https://i.pravatar.cc/150?img=1', pecas: ['Minueto em Sol Maior - J.S. Bach', 'Estudo Simples No. 1 - L. Brouwer'] },
  { id: 'p2', nome: 'Carlos Eduardo Pereira', categoria: 'Intermédio', fotoUrl: 'https://i.pravatar.cc/150?img=2', pecas: ['Concerto em Lá Menor (1º mov) - A. Vivaldi', 'Sonatina Op. 36 No. 1 (Allegro) - M. Clementi'] },
  { id: 'p3', nome: 'Mariana Alves Costa', categoria: 'Avançado', fotoUrl: 'https://i.pravatar.cc/150?img=3', pecas: ['Chaconne em Ré Menor - J.S. Bach (arr. Busoni)', 'Concerto para Violino No. 1 (Finale) - N. Paganini'] },
  { id: 'p4', nome: 'João Pedro Martins', categoria: 'Iniciante', fotoUrl: 'https://i.pravatar.cc/150?img=4', pecas: ['Melodia Húngara - F. Liszt (simplificada)', 'Pequeno Estudo - C. Czerny'] },
];

export default function JuryDashboard() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const navigate = useNavigate();

  // In a real app, fetch participants from Firestore
  const [participants, setParticipants] = useState(mockParticipants);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/"); // Redirect to login if not authenticated
    }
  }, [user, loadingAuth, navigate]);

  const handleParticipantChange = (e) => {
    setSelectedParticipantId(e.target.value);
  };

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

  if (loadingAuth) {
    return <p>Carregando autenticação...</p>; // Or a spinner component
  }
  if (errorAuth) {
    return <p>Erro de autenticação: {errorAuth.message}</p>;
  }
  if (!user) {
    return null; // Or a message, navigation is handled by useEffect
  }

  return (
    <div className="dashboard-page-container">
      
      <div className="participant-selector panel"> {/* Styling for selector can be enhanced */}
        <label htmlFor="participant-select">Selecione o Participante:</label>
        <select 
            id="participant-select" 
            value={selectedParticipantId} 
            onChange={handleParticipantChange}
            className="form-select" /* Reusing existing style */
        >
          <option value="">-- Escolha um participante --</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome} ({p.categoria})
            </option>
          ))}
        </select>
      </div>

      <main className="main-content">
        <ParticipantInfoPanel participant={selectedParticipant} />
        <ScoringPanel participant={selectedParticipant} juryEmail={user.email} />
      </main>
    </div>
  );
}