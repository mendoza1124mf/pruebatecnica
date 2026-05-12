import axios from 'axios';
 
const FASTAPI_URL = 'http://localhost:8000';
const BFF_URL = 'http://localhost:4000';

export const fastapi = {
  uploadDocument: async (file, documentType, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('user_id', userId);
 
    const response = await axios.post(`${FASTAPI_URL}/api/v1/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
 
  processDocument: async (documentId) => {
    const response = await axios.post(`${FASTAPI_URL}/api/v1/documents/${documentId}/process`);
    return response.data;
  },
};
 
export const bff = {
  getDashboardSummary: async () => {
    const response = await axios.get(`${BFF_URL}/api/v1/dashboard/summary`);
    return response.data;
  },
 
  getDocumentCompliance: async (documentId) => {
    const response = await axios.get(`${BFF_URL}/api/v1/documents/${documentId}/compliance`);
    return response.data;
  },
};
 
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || error.response.data.error || 'Error en el servidor';
  } else if (error.request) {
    return 'No se pudo conectar con el servidor';
  } else {
    return error.message || 'Error desconocido';
  }
};