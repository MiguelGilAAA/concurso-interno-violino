// src/components/ParticipantInfoPanel.jsx
import React from 'react';

export default function ParticipantInfoPanel({ participant }) {
  if (!participant) {
    return (
      <div className="panel participant-info-panel">
        <h3 className="panel-title">Informação do Participante</h3>
        <p>Selecione um participante para ver os detalhes.</p>
      </div>
    );
  }

  return (
    <div className="panel participant-info-panel">
      <h3 className="panel-title">Informação do Participante</h3>
      {participant.fotoUrl && (
        <img src={participant.fotoUrl} alt={participant.nome} />
      )}
      <p><strong>Nome:</strong> {participant.nome}</p>
      <p><strong>Categoria:</strong> {participant.categoria}</p>
      {participant.pecas && participant.pecas.length > 0 && (
        <div>
          <p><strong>Peças a Apresentar:</strong></p>
          <ul>
            {participant.pecas.map((peca, index) => (
              <li key={index}>{peca}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}