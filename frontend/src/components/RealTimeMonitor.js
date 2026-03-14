import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RealTimeMonitor = () => {
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalScanned: 0,
    threatsDetected: 0,
    safeMessages: 0,
    accuracy: 95.2
  });

  useEffect(() => {
    // Simulate real-time monitoring
    const interval = setInterval(() => {
      if (isMonitoring) {
        generateMockAlert();
        updateStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const generateMockAlert = () => {
    const mockAlerts = [
      {
        id: Date.now(),
        text: "This is a sample threatening message",
        confidence: 0.85,
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        status: 'active'
      },
      {
        id: Date.now() + 1,
        text: "You're so stupid and ugly",
        confidence: 0.92,
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ];

    const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    setAlerts(prev => [randomAlert, ...prev.slice(0, 9)]);
  };

  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      totalScanned: prev.totalScanned + Math.floor(Math.random() * 3) + 1,
      threatsDetected: prev.threatsDetected + (Math.random() > 0.7 ? 1 : 0),
      safeMessages: prev.safeMessages + Math.floor(Math.random() * 2) + 1
    }));
  };

  const handleRefresh = () => {
    setAlerts([]);
    setStats({
      totalScanned: 0,
      threatsDetected: 0,
      safeMessages: 0,
      accuracy: 95.2
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH': return <ErrorIcon color="error" />;
      case 'MEDIUM': return <WarningIcon color="warning" />;
      case 'LOW': return <CheckCircleIcon color="info" />;
      default: return <CheckCircleIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Real-Time Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
          <Badge badgeContent={alerts.length} color="error">
            <Chip
              label={isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
              color={isMonitoring ? "success" : "default"}
              onClick={() => setIsMonitoring(!isMonitoring)}
              clickable
            />
          </Badge>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detection Accuracy
            </Typography>
            <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
              {stats.accuracy}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={stats.accuracy}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Scanned
            </Typography>
            <Typography variant="h3" color="text.primary">
              {stats.totalScanned}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Messages analyzed
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Threats Detected
            </Typography>
            <Typography variant="h3" color="error">
              {stats.threatsDetected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cyberbullying cases
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Real-time Alerts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Live Alerts
          </Typography>
          {alerts.length === 0 ? (
            <Alert severity="info">
              No alerts at this time. Monitoring is {isMonitoring ? 'active' : 'paused'}.
            </Alert>
          ) : (
            <List>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {getSeverityIcon(alert.severity)}
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <ListItemText
                          primary={alert.text}
                          secondary={`Confidence: ${(alert.confidence * 100).toFixed(1)}%`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={alert.severity}
                            color={getSeverityColor(alert.severity)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RealTimeMonitor;