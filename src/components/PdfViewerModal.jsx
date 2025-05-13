// src/components/PdfViewerModal.jsx
import React from 'react';
import '../styles/PdfViewerModal.css'; // We'll create this CSS

export default function PdfViewerModal({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen || !pdfUrl) {
    return null;
  }

  // It's often better to use Google Docs Viewer for cross-browser compatibility
  // and to avoid issues with browser PDF plugin support or direct embedding restrictions.
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  // Alternative: direct embed (might not work for all PDFs or in all browsers due to security)
  // const viewerUrl = pdfUrl;


  return (
    <div className="pdf-modal-overlay-pv" onClick={onClose}>
      <div className="pdf-modal-content-pv" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header-pv">
          <h3 className="pdf-modal-title-pv">{title || 'Visualizador de Partitura'}</h3>
          <button className="pdf-modal-close-btn-pv" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="pdf-modal-body-pv">
          <iframe
            src={viewerUrl}
            title={title || 'Partitura PDF'}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            allowFullScreen
          >
            Seu browser não suporta iframes ou o PDF não pôde ser carregado.
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Abrir PDF numa nova aba.</a>
          </iframe>
        </div>
      </div>
    </div>
  );
}