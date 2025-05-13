// src/components/ScoringPanel.jsx
import React, { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    doc, // Import doc
    setDoc, // Import setDoc (or updateDoc)
    query, // Import query
    where, // Import where
    getDocs, // Import getDocs
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path

// Define CRITERIA_KEYS if not already defined globally or imported
const CRITERIA_KEYS = ['afinacao', 'ritmo', 'som', 'postura', 'expressividade', 'presenca'];



export default function ScoringPanel({ participant, juryEmail }) { // Removed onEvaluationLoaded as it's not strictly needed for this direct update
  const initialFormState = {
    afinacao: 5,
    ritmo: 5,
    som: 5,
    postura: 5,
    expressividade: 5,
    presenca: 5,
    pontoForte: '',
    sugestao: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false); // For submit loading
  const [isFetchingExisting, setIsFetchingExisting] = useState(false); // For loading existing score
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [existingDocId, setExistingDocId] = useState(null); // To store ID of existing evaluation

  // Effect to fetch existing evaluation when participant or juryEmail changes
  useEffect(() => {
    // Function to fetch existing evaluation
    const fetchExistingEvaluation = async () => {
      if (!participant || !juryEmail) {
        setFormData(initialFormState);
        setExistingDocId(null);
        setSuccessMessage(''); // Clear messages
        setErrorMessage('');
        return;
      }

      setIsFetchingExisting(true);
      setSuccessMessage('');
      setErrorMessage('');
      // console.log(`Fetching for participant: ${participant.id}, jury: ${juryEmail}`); // For debugging

      try {
        const q = query(
          collection(db, 'avaliacoes'),
          where('participantId', '==', participant.id),
          where('juryEmail', '==', juryEmail)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingEvalDoc = querySnapshot.docs[0]; // Assuming only one doc per participant/jury
          const evalData = existingEvalDoc.data();
          // console.log('Found existing evaluation:', evalData); // For debugging
          setFormData({
            afinacao: evalData.scores?.afinacao !== undefined ? evalData.scores.afinacao : 5,
            ritmo: evalData.scores?.ritmo !== undefined ? evalData.scores.ritmo : 5,
            som: evalData.scores?.som !== undefined ? evalData.scores.som : 5,
            postura: evalData.scores?.postura !== undefined ? evalData.scores.postura : 5,
            expressividade: evalData.scores?.expressividade !== undefined ? evalData.scores.expressividade : 5,
            presenca: evalData.scores?.presenca !== undefined ? evalData.scores.presenca : 5,
            pontoForte: evalData.pontoForte || '',
            sugestao: evalData.sugestao || '',
          });
          setExistingDocId(existingEvalDoc.id);
        } else {
          // console.log('No existing evaluation found. Resetting form.'); // For debugging
          setFormData(initialFormState); // No existing evaluation, reset form
          setExistingDocId(null);
        }
      } catch (error) {
        console.error("Error fetching existing evaluation:", error);
        setErrorMessage("Erro ao carregar avaliação existente.");
        setFormData(initialFormState); // Reset on error
        setExistingDocId(null);
      } finally {
        setIsFetchingExisting(false);
      }
    };

    fetchExistingEvaluation();
  }, [participant, juryEmail]); // Rerun when participant or juryEmail changes


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!participant) {
      setErrorMessage('Por favor, selecione um participante primeiro.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const evaluationData = {
      participantId: participant.id,
      participantName: participant.nome,
      participantCategoria: participant.categoria,
      juryEmail: juryEmail,
      scores: { // Nest scores for clarity
        afinacao: formData.afinacao,
        ritmo: formData.ritmo,
        som: formData.som,
        postura: formData.postura,
        expressividade: formData.expressividade,
        presenca: formData.presenca,
      },
      pontoForte: formData.pontoForte,
      sugestao: formData.sugestao,
      // Update timestamp for both new and updated evaluations
      timestamp: serverTimestamp(),
    };

    try {
      if (existingDocId) {
        // Update existing document
        const docRef = doc(db, 'avaliacoes', existingDocId);
        // Using setDoc with merge: true is generally safer if the structure might change
        // or if you only want to update provided fields.
        // updateDoc only updates specified fields and errors if the doc doesn't exist.
        await setDoc(docRef, evaluationData, { merge: true });
        setSuccessMessage('✅ Avaliação atualizada com sucesso!');
      } else {
        // Add new document
        const newDocRef = await addDoc(collection(db, 'avaliacoes'), evaluationData);
        setExistingDocId(newDocRef.id); // Important: Store the new ID so subsequent saves are updates
        setSuccessMessage('✅ Avaliação enviada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      setErrorMessage('Erro ao enviar/atualizar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!participant) {
    return (
      <div className="panel scoring-panel">
        <h3 className="panel-title">Painel de Avaliação 🎻</h3>
        <p>Selecione um participante para iniciar a avaliação.</p>
      </div>
    );
  }

  // New: Loading state while fetching existing evaluation
  if (isFetchingExisting) {
    return (
      <div className="panel scoring-panel">
        <h3 className="panel-title">Avaliar: {participant.nome} ({participant.categoria})</h3>
        <p className="loading-text-panel">Carregando dados da avaliação...</p> {/* Added class for specific styling */}
      </div>
    );
  }

  return (
    <div className="panel scoring-panel">
      <h3 className="panel-title">
        Avaliar: {participant.nome} ({participant.categoria})
        {existingDocId && <span className="editing-indicator"> (Editando)</span>} {/* Optional indicator */}
      </h3>

      {successMessage && <div className="message success-message">{successMessage}</div>}
      {errorMessage && <div className="message error-message">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        {CRITERIA_KEYS.map((campo) => ( // Used CRITERIA_KEYS here
          <div key={campo} className="range-slider-container">
            {/* Capitalized label */}
            <label htmlFor={campo} className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
            <div className="range-slider-wrapper">
              <input
                type="range"
                id={campo}
                name={campo}
                min="0"
                max="10"
                value={formData[campo]}
                onChange={handleSliderChange}
                className="form-range"
              />
              <div className="range-value">{formData[campo]}</div>
            </div>
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="pontoForte" className="form-label">Ponto forte da atuação</label>
          <textarea
            id="pontoForte"
            name="pontoForte"
            placeholder="Descreva o principal ponto forte..."
            value={formData.pontoForte}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="sugestao" className="form-label">Sugestão para evolução</label>
          <textarea
            id="sugestao"
            name="sugestao"
            placeholder="Sugestões construtivas..."
            value={formData.sugestao}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <button type="submit" disabled={loading || isFetchingExisting || !participant} className="submit-button">
          {loading ? (existingDocId ? 'Atualizando...' : 'Enviando...')
                   : (existingDocId ? 'Atualizar Avaliação' : 'Enviar Avaliação')}
        </button>
      </form>
    </div>
  );
}