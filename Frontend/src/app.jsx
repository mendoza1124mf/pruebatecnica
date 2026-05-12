import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Upload from './components/upload';
import './app.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io('http://localhost:4000');

      newSocket.on('connect', () => {
        console.log('Conectado a BFF express para notificaciones en tiempo real');
      });

      newSocket.on('documento_procesado', (data) => {
        addNotification(`Documento ${data.document_id.substring(0, 8)}... procesado: ${data.status_doc}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Desconectado de BFF');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLoggedIn]);

  const handleLogin = (id) => {
    setUserId(id);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setActiveTab('dashboard');
    if (socket) {
      socket.disconnect();
    }
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">

      <div className="notifications-container">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-toast">
            {notif.message}
          </div>
        ))}
      </div>

      <nav className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
         Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Subir Documento
        </button>
      </nav>

      <div className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard userId={userId} onLogout={handleLogout} />
        )}
        {activeTab === 'upload' && <Upload userId={userId} />}
      </div>
    </div>
  );
}