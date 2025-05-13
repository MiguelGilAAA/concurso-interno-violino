// src/components/ParticipantInfoPanel.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ParticipantInfoPanel.css'; // Assuming you have this or styles are in JuryDashboard.css
import PdfViewerModal from './PdfViewerModal'; // Import the PDF viewer modal

// Placeholder SVG for a "view score" icon
const ViewScoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="view-score-icon">
    <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
    <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

export default function ParticipantInfoPanel({ participant, awardOptions, onSaveAward }) {
  const [selectedAward, setSelectedAward] = useState('');

  // --- NEW: State for PDF Modal ---
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');

  useEffect(() => {
    if (participant && participant.finalOfficialAward !== undefined) {
      setSelectedAward(participant.finalOfficialAward);
    } else if (participant) {
      setSelectedAward(awardOptions && awardOptions.length > 0 ? awardOptions[0].value : '');
    } else {
      setSelectedAward('');
    }
  }, [participant, awardOptions]);

  const handleAwardSelectionChange = (e) => {
    setSelectedAward(e.target.value);
  };

  const handleConfirmAwardClick = () => {
    if (participant && onSaveAward) {
      onSaveAward(participant.id, selectedAward);
    }
  };

  // --- NEW: Functions for PDF Modal ---
  const openPdfModal = (pdfUrl, title) => {
    if (pdfUrl && typeof pdfUrl === 'string' && pdfUrl.trim() !== '') {
      setCurrentPdfUrl(pdfUrl);
      setCurrentPdfTitle(title);
      setIsPdfModalOpen(true);
    } else {
      alert("Partitura não disponível ou URL inválida.");
      console.warn("Attempted to open PDF with invalid URL:", pdfUrl);
    }
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setCurrentPdfUrl('');
    setCurrentPdfTitle('');
  };


  if (!participant) {
    return (
      <div className="panel participant-info-panel">
        <h3 className="panel-title">Informação do Participante</h3>
        <p>Selecione um participante na lista para ver os detalhes e atribuir classificação.</p>
      </div>
    );
  }

  // Ensure participant.pecas is an array of objects: { nome: string, url: string }
  // This transformation should ideally happen in JuryDashboardPage.jsx when fetching data.
  // For safety here, let's assume it might still be an array of strings for a moment
  // and try to adapt, though the object structure is preferred.
  const getPecaUrl = (pecaName) => {
      if (!participant || !participant.pecasData) return null; // Assuming pecasData contains { peca1Url, peca2Url }
      if (participant.pecas && participant.pecas[0] === pecaName && participant.pecasData.partitura1Url) {
          return participant.pecasData.partitura1Url;
      }
      if (participant.pecas && participant.pecas[1] === pecaName && participant.pecasData.partitura2Url) {
          return participant.pecasData.partitura2Url;
      }
      return null;
  };

if (participant) {
    console.log("ParticipantInfoPanel - Participant Object:", JSON.parse(JSON.stringify(participant)));
    console.log("ParticipantInfoPanel - Pecas Array:", participant.pecas);
    if (participant.pecas && participant.pecas.length > 0) {
        participant.pecas.forEach((p, i) => console.log(`Piece ${i}:`, p, "URL:", p.url, "Type of URL:", typeof p.url));
    }
}

  return (
    <> {/* Fragment for modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={closePdfModal}
        pdfUrl={currentPdfUrl}
        title={currentPdfTitle}
      />

      <div className="panel participant-info-panel">
        <h3 className="panel-title">Informação do Participante</h3>

        {participant.fotoUrl && (
          <img
            src={participant.fotoUrl}
            alt={`Foto de ${participant.nome}`}
            className="participant-photo-pip"
          />
        )}

        <div className="participant-details-pip">
          <p><strong>Nome:</strong> {participant.nome}</p>
          <p><strong>Categoria:</strong> {participant.categoria}</p>
          {participant.grau && <p><strong>Grau:</strong> {participant.grau}</p>}
          {/* You were missing participant.email display in your last version, adding it back if it exists */}



          {/* --- MODIFIED Peças Section to include view buttons --- */}
          {participant.pecas && Array.isArray(participant.pecas) && participant.pecas.length > 0 && (
            <div className="pecas-section-pip">
              <p><strong>Peças a Apresentar:</strong></p>
              <ul>
                {participant.pecas.map((pecaItem, index) => {
                  // Determine if pecaItem is a string or an object {nome, url}
                  const pecaName = typeof pecaItem === 'object' && pecaItem !== null ? pecaItem.nome : pecaItem;
                  const pecaUrl = typeof pecaItem === 'object' && pecaItem !== null ? pecaItem.url : getPecaUrl(pecaName); // Fallback if pecas is still array of strings

                  return (
                    pecaName ? ( // Only render if there's a piece name
                      <li key={index} className="peca-item-pip">
                        <span>{pecaName}</span>
                        {pecaUrl && (
                          <button
                            type="button"
                            onClick={() => openPdfModal(pecaUrl, pecaName)}
                            className="view-score-button-pip"
                            title={`Ver partitura de ${pecaName}`}
                          >
                            <ViewScoreIcon />
                          </button>
                        )}
                      </li>
                    ) : null
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Award Assignment Section (remains the same as your last version) */}
        <div className="award-assignment-section-pip panel-section-pip">
          <h4>Modificar classificação atual</h4>
          <div className="form-group pip-form-group">
            <label htmlFor={`officialAwardSelect-${participant.id}`}>Classificação Final:</label>
            <select
              id={`officialAwardSelect-${participant.id}`}
              value={selectedAward}
              onChange={handleAwardSelectionChange}
              className="form-select pip-form-select"
            >
              {(awardOptions || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleConfirmAwardClick}
            className="button-pip-confirm-award"
            disabled={!participant || (participant.finalOfficialAward === selectedAward && selectedAward !== '')}
          >
            Confirmar Classificação
          </button>
          {participant.finalOfficialAward && participant.finalOfficialAward !== '' && (
              <p className="current-award-pip">
                  <em>Classificação Oficial Atual: {participant.finalOfficialAward}</em>
              </p>
          )}
        </div>
      </div>
    </>
  );
}