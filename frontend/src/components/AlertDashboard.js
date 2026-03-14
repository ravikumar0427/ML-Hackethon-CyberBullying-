import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiClock, FiFilter } from 'react-icons/fi';
import io from 'socket.io-client';
import './AlertDashboard.css';

const AlertDashboard = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [filter, setFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket for real-time alerts
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      // Play sound notification
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    });

    return () => newSocket.close();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'high') return alert.confidence > 0.7;
    if (filter === 'medium') return alert.confidence > 0.4 && alert.confidence <= 0.7;
    return true;
  });

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence > 0.7) return { label: 'High', class: 'high' };
    if (confidence > 0.4) return { label: 'Medium', class: 'medium' };
    return { label: 'Low', class: 'low' };
  };

  return (
    <motion.div 
      className="alert-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="dashboard-header">
        <h2>Alert Dashboard</h2>
        <div className="filter-controls">
          <FiFilter />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Alerts</option>
            <option value="high">High Confidence</option>
            <option value="medium">Medium Confidence</option>
          </select>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon danger" />
          <div className="stat-info">
            <span className="stat-value">{alerts.length}</span>
            <span className="stat-label">Total Alerts</span>
          </div>
        </div>
        <div className="stat-card">
          <FiClock className="stat-icon warning" />
          <div className="stat-info">
            <span className="stat-value">
              {alerts.filter(a => a.confidence > 0.7).length}
            </span>
            <span className="stat-label">High Risk</span>
          </div>
        </div>
      </div>

      <div className="alerts-list">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id || index}
              className={`alert-item ${getConfidenceLevel(alert.confidence).class}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-badge">
                    {getConfidenceLevel(alert.confidence).label} Risk
                  </span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="alert-message">{alert.content || alert.message}</p>
                <div className="alert-footer">
                  <span className="confidence">
                    Confidence: {(alert.confidence * 100).toFixed(1)}%
                  </span>
                  <button 
                    className="dismiss-btn"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <FiCheck /> Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <motion.div 
            className="no-alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiCheck className="no-alerts-icon" />
            <p>No alerts to display</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AlertDashboard;
