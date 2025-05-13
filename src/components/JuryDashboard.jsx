// src/components/JuryDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore'; // Added doc, setDoc

import Navbar from './Navbar'; // <<< RE-ADD NAVBAR IMPORT
import ParticipantInfoPanel from './ParticipantInfoPanel';
import ScoringPanel from './ScoringPanel';
import SimpleModal from './SimpleModal'; // <<< IMPORT SimpleModal

import '../styles/JuryDashboard.css';

const AWARD_OPTIONS_DASHBOARD = [
    { value: '', label: 'Média Calculada' },
    { value: '2º Prémio', label: '2º Prémio' },
    { value: '3º Prémio', label: '3º Prémio' },
    { value: 'Menção Honrosa', label: 'Menção Honrosa' },
    { value: 'Não Atribuído', label: 'Não Atribuído / Sem Prémio' }
];

export default function JuryDashboardPage() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [fetchError, setFetchError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

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
            const pecasArray = []; // Initialize an empty array for pieces

                    // Handle Peca 1
                    if (data.peca1) { // Check if peca1 name exists
                      pecasArray.push({
                        nome: data.peca1,
                        url: data.partitura1Url || null // Use the URL if it exists, otherwise null
                      });
                    }

                    // Handle Peca 2
                    if (data.peca2) { // Check if peca2 name exists
                      pecasArray.push({
                        nome: data.peca2,
                        url: data.partitura2Url || null // Use the URL if it exists, otherwise null
                      });
                    }
          return {
            id: doc.id,
            nome: data.nome || 'Nome Indisponível',
            categoria: data.categoria || 'Categoria Indisponível',
            grau: data.grau || 'Grau não especificado',
            fotoUrl: data.fotoUrl || '',
            pecas: [
                data.peca1 ? { nome: data.peca1, url: data.partitura1Url || null } : null,
                data.peca2 ? { nome: data.peca2, url: data.partitura2Url || null } : null
            ].filter(peca => peca && peca.nome), //
            email: data.email || '',
            finalOfficialAward: data.finalOfficialAward || '', // Fetch the saved official award
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

  // --- DEFINE handleSaveOfficialAward ---
  const handleSaveOfficialAward = async (participantId, awardString) => {
    if (!participantId) {
        setModalContent({ title: "Erro", message: "Nenhum participante selecionado para atribuir classificação." });
        setIsModalOpen(true);
        return;
    }
    // Find the participant's full name for the confirmation message
    const participantToUpdate = participants.find(p => p.id === participantId);
    const participantName = participantToUpdate ? participantToUpdate.nome : "Participante desconhecido";

    try {
      const participantDocRef = doc(db, "inscricoes", participantId);
      await setDoc(participantDocRef, { finalOfficialAward: awardString }, { merge: true });

      // Update local participants state to reflect the change immediately
      setParticipants(prevParticipants =>
        prevParticipants.map(p =>
          p.id === participantId ? { ...p, finalOfficialAward: awardString } : p
        )
      );
      setModalContent({
        title: "Sucesso!",
        message: `Classificação oficial para ${participantName} definida como: "${awardString || "Média Calculada"}".`
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error saving official award: ", error);
      setModalContent({ title: "Erro ao Salvar", message: "Falha ao atualizar a classificação oficial." });
      setIsModalOpen(true);
    }
  };
  // --- END handleSaveOfficialAward ---

  if (loadingAuth) {
    return <div className="page-loading-full"><p>Carregando autenticação...</p></div>;
  }
  if (errorAuth) {
    return <div className="page-error-full"><p>Erro de autenticação: {errorAuth.message}</p></div>;
  }
  if (!user) {
    return null; // JuryLayout should handle redirect if this component is under it
  }

  return (
    <div className="dashboard-page-container">
      <SimpleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}>
        <p>{modalContent.message}</p>
      </SimpleModal>



      {isLoadingParticipants ? (
        <div className="panel loading-panel-content"><p>A carregar participantes...</p></div>
      ) : fetchError ? (
        <div className="panel error-message-content">{fetchError}</div>
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
                  {p.nome} ({p.categoria})
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhum participante encontrado.</option>
            )}
          </select>
        </div>
      )}

      <main className="main-content">
        <ParticipantInfoPanel
          participant={selectedParticipant}
          awardOptions={AWARD_OPTIONS_DASHBOARD}
          onSaveAward={handleSaveOfficialAward} // Prop is now correctly passed
        />
        <ScoringPanel
          participant={selectedParticipant}
          juryEmail={user?.email}
          // If ScoringPanel still has its own awardedPlaceByJury for individual jury suggestions,
          // that's separate from the finalOfficialAward handled here.
        />
      </main>
    </div>
  );
}