import React, { useState } from 'react';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      alert('Por favor ingresa un ID de usuario');
      return;
    }
    setLoading(true);
    // Simular pequeño delay para UX
    setTimeout(() => {
      onLogin(userId);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>inicio de sesión</h1>
          <p>Gestión de Documentos y Verificación de Cumplimiento</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">ID de Usuario</label>
            <input
              id="userId"
              type="text"
              placeholder="(UUID)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              defaultValue="user-001"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}