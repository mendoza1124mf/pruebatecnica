import app from './notificacion.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Escuchando en puerto: ${PORT} `);
});