import React from 'react';
import '../styles/table.css';
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function DocumentsTable({ documents, onProcess, onViewCompliance }) {
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);

const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const currentDocuments = documents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  return (
    <div className="table-wrapper">
      <table className="documents-table">
        <thead>
          <tr>
            <th>Archivo</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentDocuments.map((doc) => (
            <tr key={doc.id} className={`status-${doc.status.toLowerCase()}`}>
              <td className="filename">
                <span className="file-icon">📄</span>
                {doc.filename}
              </td>
              <td>
                <span className="badge badge-type">{doc.document_type}</span>
              </td>
              <td>
                <span className={`badge badge-status badge-${doc.status.toLowerCase()}`}>
                  {doc.status === 'UPLOADED' ? 'Pendiente' : 'Procesado'}
                </span>
              </td>
              <td className="date">
                {new Date(doc.created_at).toLocaleDateString('es-ES')}
              </td>
              <td className="actions">
                {doc.status === 'UPLOADED' ? (
                  <button
                    className="btn-action btn-process"
                    onClick={() => onProcess(doc.id)}
                    title="Procesar documento"
                  >
                    Procesar documento
                  </button>
                ) : doc.status === 'Processed' ? (
                  <button
                    className="btn-action btn-compliance"
                    onClick={() => onViewCompliance(doc.id)}
                    title="Ver compliance status"
                  >
                    Status de cumplimiento
                  </button>
                ) : (
                  <span className="processing">Procesando...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}