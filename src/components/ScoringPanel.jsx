// src/components/ScoringPanel.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path

export default function ScoringPanel({ participant, juryEmail }) {
  const initialFormState = {
    afinacao: 5,
    ritmo: 5,
    som: 5,
    tecnica: 5,
    expressividade: 5,
    presenca: 5,
    pontoForte: '',
    sugestao: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when participant changes
  useEffect(() => {
    setFormData(initialFormState);
    setSuccessMessage('');
    setErrorMessage('');
  }, [participant]);


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

    try {
      await addDoc(collection(db, 'avaliacoes'), {
        participantId: participant.id,
        participantName: participant.nome,
        participantCategoria: participant.categoria,
        juryEmail: juryEmail,
        scores: { // Nest scores for clarity
          afinacao: formData.afinacao,
          ritmo: formData.ritmo,
          som: formData.som,
          tecnica: formData.tecnica,
          expressividade: formData.expressividade,
          presenca: formData.presenca,
        },
        pontoForte: formData.pontoForte,
        sugestao: formData.sugestao,
        timestamp: serverTimestamp(),
      });

      setSuccessMessage('✅ Avaliação enviada com sucesso!');
      // Optionally, clear form or move to next participant logic here
      // setFormData(initialFormState); // Already handled by useEffect on participant change
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      setErrorMessage('Erro ao enviar. Tente novamente.');
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

  return (
    <div className="panel scoring-panel">
      <h3 className="panel-title">Avaliar: {participant.nome} ({participant.categoria})</h3>

      {successMessage && <div className="message success-message">{successMessage}</div>}
      {errorMessage && <div className="message error-message">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* Participant Name and Category are now displayed in title, not as inputs */}

        {['afinacao', 'ritmo', 'som', 'tecnica', 'expressividade', 'presenca'].map((campo) => (
          <div key={campo} className="range-slider-container">
            <label htmlFor={campo} className="form-label">{campo}</label>
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

        <button type="submit" disabled={loading || !participant} className="submit-button">
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </form>
    </div>
  );
}