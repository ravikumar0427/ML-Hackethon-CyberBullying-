import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MessageAnalyzer from './components/MessageAnalyzer';
import Statistics from './components/Statistics';
import History from './components/History';
import Alerts from './components/Alerts';
import SafetyTools from './components/SafetyTools';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <div>Loading...</div>
      </Box>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AppLayout = ({ darkMode, setDarkMode }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Box sx={{ flexGrow: 1, pt: 8, px: 3, ml: { md: '260px' } }}>
        <Routes>
          <Route path="/" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/analyzer" element={<MessageAnalyzer darkMode={darkMode} />} />
          <Route path="/statistics" element={<Statistics darkMode={darkMode} />} />
          <Route path="/history" element={<History darkMode={darkMode} />} />
          <Route path="/alerts" element={<Alerts darkMode={darkMode} />} />
          <Route path="/safety" element={<SafetyTools darkMode={darkMode} />} />
        </Routes>
      </Box>
    </Box>
  );
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#667eea' },
      secondary: { main: '#764ba2' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App = () => {
  // Set demo token for immediate testing
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'demo_token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com'
      }));
    }
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;