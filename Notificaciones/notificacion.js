import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { dashboard_sumary, guardarEvento, obtenerCompilanceCheck } from './expressBff.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"], 
    },
  });


io.on('connection', (socket) => {
    console.log('Usuario conectado - Dashboard');

    socket.on('disconnect', () => {
        console.log('Socket desconectado - Dashboard');
    });
});

app.get('/api/v1/dashboard/summary', async (req, res) => {
  try {
    const summary = await dashboard_sumary();
    res.json(summary);
  } catch (error) {
    console.error('Error al obtener el resumen del tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post("/api/v1/webhooks/processing-complete", async (req, res) => {
  const { document_id, document_type, status_doc } = req.body;

  if (!document_id) {
    return res.status(400).json({ error: "id de documento es requerido" });
  }

  try {
     console.log(`Documento ${document_id} procesado - Status: ${status_doc}`);
     
         await guardarEvento(req.body);
     
         io.emit('processed', {
           document_id,
           document_type,
           status_doc,
           compliance: compliance || null,
           timestamp: new Date().toISOString(),
         });
     
         console.log(`Notificación emitida`);
     
         res.status(201).json({
           success: true,
           message: 'Documento procesado y notificación emitida',
           document_id,
         });
  } catch (error) {
    console.error("[ERROR] /api/v1/webhooks/processing-complete:", error);
    res.status(500).json({
      error: "falla al procesar la notificación",
      message: error.message,
    });
  }
});


app.get('/api/v1/documents/:documentId/compliance', async (req, res) => {
  try {
    const { documentId } = req.params;
    console.log(`[GET] /api/v1/documents/${documentId}/compliance`);

    const compliance = await obtenerCompilanceCheck(documentId);

    if (!compliance) {
      return res.status(404).json({
        error: 'Compliance_check no encontrado',
        document_id: documentId,
      });
    }

    res.json(compliance);
  } catch (error) {
    console.error('[ERROR] GET /api/v1/documents/:DocumentId/compliance:', error.message);
    res.status(500).json({
      error: 'Error al obtener compliance_check del documento',
      message: error.message,
    });
  }
});


export default httpServer;