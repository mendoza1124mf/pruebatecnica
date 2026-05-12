import React from 'react';
import '../styles/modal.css';

export default function ComplianceModal({ documentId, compliance, loading, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Compliance Status</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Cargando status...</p>
            </div>
          ) : compliance ? (
            <div className="compliance-details">
              <div className="compliance-item">
                <span className="label">Status:</span>
                <span className={`value status-${compliance.status.toLowerCase()}`}>
                  {compliance.status}
                </span>
              </div>

              <div className="compliance-item">
                <span className="label">Check ID:</span>
                <span className="value monospace">{compliance.check_id}</span>
              </div>

              <div className="compliance-item">
                <span className="label">Detalles:</span>
                <span className="value">{compliance.details}</span>
              </div>

              <div className="compliance-item">
                <span className="label">Verificado:</span>
                <span className="value">
                  {new Date(compliance.checked_at).toLocaleString('es-ES')}
                </span>
              </div>

              <div className="compliance-item">
                <span className="label">Document ID:</span>
                <span className="value monospace">{compliance.document_id}</span>
              </div>

              <div className={`status-badge badge-${compliance.status.toLowerCase()}`}>
                {compliance.status === 'COMPLIANT' ? 'Cumple' : 'No Cumple'}
              </div>
            </div>
          ) : (
            <div className="modal-error">
              <p>No se pudo cargar el estado de compliance_check</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}