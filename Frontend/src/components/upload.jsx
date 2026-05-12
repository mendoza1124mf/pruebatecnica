import React, { useState } from 'react';
import { fastapi, handleApiError } from '../api';
import '../styles/upload.css';

export default function Upload({ userId }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('financial_report');
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setLoading(true);
      setUploadMessage(null);

      await fastapi.uploadDocument(file, documentType, userId);

      setUploadMessage({
        type: 'success',
        text: `Documento "${file.name}" subido exitosamente`,
      });

      setFile(null);
      setDocumentType('financial_report');
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: 'Error al subir el documento: ' + handleApiError(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Subir Documento</h2>
        <p className="upload-subtitle">Carga un documento para verificar su cumplimiento</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="documentType">Tipo de Documento</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={loading}
            >
              <option value="financial_report">Reporte Financiero</option>
              <option value="tax_filing">Declaración de Impuestos</option>
              <option value="regulatory_disclosure">Divulgación Regulatoria</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fileInput">Seleccionar Archivo</label>
            <div className="file-input-wrapper">
              <input
                id="fileInput"
                type="file"
                onChange={handleFileSelect}
                disabled={loading}
                accept=".txt"
              />
              <span className="file-input-content">
                <p>
                  {file ? file.name : "Elige un archivo o arrástralo aquí"}
                </p>
              </span>
            </div>
          </div>
         
          <button type="submit" className="btn-upload" disabled={loading || !file}>
            {loading ? 'Subiendo...' : 'Subir Documento'}
          </button>
        </form>
        
        {uploadMessage && (
          <div className={`upload-message ${uploadMessage.type}`}>
            {uploadMessage.text}
          </div>
        )}

      </div>
    </div>
  );
}