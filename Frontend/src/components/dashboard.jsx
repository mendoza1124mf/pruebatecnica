import React, { useState, useEffect } from 'react';
import { bff, fastapi, handleApiError } from '../api';
import DocumentsTable from './table';
import ComplianceModal from './modal';
import '../styles/dashboard.css';

export default function Dashboard({ userId, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [compliance, setCompliance] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bff.getDashboardSummary();
      setDocuments(data.items || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocument = async (documentId) => {
    try {
      await fastapi.processDocument(documentId);
      alert('Documento enviado a procesamiento');
      setTimeout(loadDocuments, 1000);
    } catch (err) {
      alert('Error: ' + handleApiError(err));
    }
  };

  const handleViewCompliance = async (documentId) => {
    setSelectedDocument(documentId);
    setShowComplianceModal(true);
    setComplianceLoading(true);

    try {
      const data = await bff.getDocumentCompliance(documentId);
      setCompliance(data);
    } catch (err) {
      setCompliance(null);
      alert('Error: ' + handleApiError(err));
    } finally {
      setComplianceLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowComplianceModal(false);
    setSelectedDocument(null);
    setCompliance(null);
  };


  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocuments = documents.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(documents.length / pageSize);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard de Documentos</h1>
          <p>Total: {documents.length} documentos</p>
        </div>
        <div className="header-actions">
          <span className="user-info">{userId}</span>
          <button className="btn-logout" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-alert">
            <strong>Error:</strong> {error}
            <button onClick={loadDocuments} className="btn-retry">
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <p>No hay documentos aún</p>
            <p className="empty-subtitle">Sube tu primer documento en la sección: Subir Documento</p>
          </div>
        ) : (
          <>
            <DocumentsTable
              documents={paginatedDocuments}
              onProcess={handleProcessDocument}
              onViewCompliance={handleViewCompliance}
            />

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-pagination"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Anterior
                </button>

                <div className="pagination-info">
                  Página {currentPage} de {totalPages}
                </div>

                <button
                  className="btn-pagination"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showComplianceModal && (
        <ComplianceModal
          documentId={selectedDocument}
          compliance={compliance}
          loading={complianceLoading}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}