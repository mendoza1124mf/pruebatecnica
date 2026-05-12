import { config } from "./config.js";

export async function dashboard_sumary() {
  try {
    const docsResponse = await fetch(
      `${config.fastapi.baseUrl}${config.fastapi.endpoints.documents}?page=1&page_size=100`,
      { timeout: 5000 }
    );

    if (!docsResponse.ok) {
      throw new Error(`FastAPI error: ${docsResponse.status}`);
    }

    const docsData = await docsResponse.json();
    const documents = docsData.items || [];

    const documentStats = {
      total: docsData.total,
      uploaded: documents.filter((d) => d.status === "UPLOADED").length,
      processed: documents.filter((d) => d.status === "processed").length,
    };

    return {
      timestamp: new Date().toISOString(),
      documents: documentStats,
      items: documents, 
    };

  }catch (error) {
    console.warn(`[WARNING] Error obteniendo status para ${documentId}`);
    return null;
  }
}

export async function obtenerCompilanceCheck(documentId) {
 try {
    const url = `${config.gateway.baseUrl}/api/v1/compliance/status/${documentId}`;
    console.log(`[DEBUG] URL completa: ${url}`);
    
    const response = await fetch(url, { timeout: 5000 });
    
    console.log(`[DEBUG] Status: ${response.status}`);
    console.log(`[DEBUG] OK: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[DEBUG] Response error: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[DEBUG] Data recibida:`, data);
    return data;
  } catch (error) {
    console.error(`[ERROR] obtenerCompilanceCheck: ${error.message}`);
    console.error(`[ERROR] Stack:`, error.stack);
    return null;
  }
}

export async function guardarEvento(event) {
  try {
    console.log("[WEBHOOK EVENT]", {
      document_id: event.document_id,
      status: event.status_doc,
      compliance: event.compliance?.status || "DESCONOCIDO",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      eventId: event.document_id,
    };
  } catch (error) {
    console.error("[ERROR]:", error.message);
    throw error;
  }
}
