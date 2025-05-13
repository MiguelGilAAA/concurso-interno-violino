// src/components/SimpleModal.jsx
import React from 'react';
import '../styles/SimpleModal.css'; // We'll create this CSS

export default function SimpleModal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay-sp" onClick={onClose}>
      <div className="modal-content-sp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sp">
          {title && <h3 className="modal-title-sp">{title}</h3>}
          <button className="modal-close-btn-sp" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body-sp">
          {children}
        </div>
        <div className="modal-footer-sp">
          <button className="modal-ok-btn-sp" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}