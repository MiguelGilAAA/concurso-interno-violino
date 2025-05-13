// src/components/JuryDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase"; // Import db from firebase
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Removed 'where' as it's not used here yet

import ParticipantInfoPanel from './ParticipantInfoPanel';
import ScoringPanel from './ScoringPanel';

import '../styles/JuryDashboard.css'; // Assuming this path is correct

export default function JuryDashboardPage() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/jurylogin");
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!user) return;

      setIsLoadingParticipants(true);
      setFetchError(null);
      try {
        const q = query(collection(db, "inscricoes"), orderBy("dataInscricao", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedParticipants = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome || 'Nome Indisponível',
            categoria: data.categoria || 'Categoria Indisponível',
            fotoUrl: data.fotoUrl || '',
            pecas: [data.peca1, data.peca2].filter(peca => peca),
            grau: data.grau || 'Grau não especificado', // <<< CORRECTED: Comma instead of semicolon
            email: data.email || '' // Added email, ensure it's in your Firestore docs
            // nomeProfessor: data.nomeProfessor, // Add if needed by ParticipantInfoPanel
          };
        });
        setParticipants(fetchedParticipants);
      } catch (error) {
        console.error("Error fetching participants: ", error);
        setFetchError("Erro ao carregar lista de participantes.");
      } finally {
        setIsLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [user]);

  const handleParticipantChange = (e) => {
    setSelectedParticipantId(e.target.value);
  };

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

  if (loadingAuth) {
    return <div className="page-loading-full"><p>Carregando autenticação...</p></div>;
  }
  if (errorAuth) {
    return <div className="page-error-full"><p>Erro de autenticação: {errorAuth.message}</p></div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page-container">

      {isLoadingParticipants ? (
        <div className="panel loading-panel-content"><p>A carregar participantes...</p></div> // Added a class for specific styling
      ) : fetchError ? (
        <div className="panel error-message-content">{fetchError}</div> // Added a class for specific styling
      ) : (
        <div className="participant-selector panel">
          <label htmlFor="participant-select">Selecione o Participante:</label>
          <select
              id="participant-select"
              value={selectedParticipantId}
              onChange={handleParticipantChange}
              className="form-select"
          >
            <option value="">-- Escolha um participante --</option>
            {participants.length > 0 ? (
              participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.categoria} - {p.grau}) {/* Optionally display grau here */}
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhum participante encontrado.</option>
            )}
          </select>
        </div>
      )}

      <main className="main-content">
        <ParticipantInfoPanel participant={selectedParticipant} />
        <ScoringPanel participant={selectedParticipant} juryEmail={user?.email} />
      </main>
    </div>
  );
}