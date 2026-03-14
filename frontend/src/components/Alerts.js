import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Notifications,
  MarkEmailRead,
  Person,
  Schedule,
  PriorityHigh,
  Refresh,
  Visibility,
  Delete
} from '@mui/icons-material';
import { getAlerts, resolveAlert } from '../services/api';

const Alerts = ({ darkMode }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // ✅ FIXED: Handle any response format (object or array)
  const fetchAlerts = async () => {
    try {
      const response = await getAlerts();
      
      // Handle both response formats:
      // 1. Direct array: response.data = [...]
      // 2. Object with array: response.data = { success: true, alerts: [...] }
      const alertsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.alerts || response.data || [];
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    
    // Listen for new analysis events
    const handleNewAnalysis = () => {
      fetchAlerts();
    };
    window.addEventListener('newAnalysis', handleNewAnalysis);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('newAnalysis', handleNewAnalysis);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setDetailsOpen(false);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
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
      case 'HIGH': return <Error color="error" />;
      case 'MEDIUM': return <Warning color="warning" />;
      case 'LOW': return <Info color="info" />;
      default: return <Info />;
    }
  };

  // ✅ FIXED: Use Array.isArray() to prevent filter errors
  const pendingAlerts = Array.isArray(alerts) ? alerts.filter(alert => alert.status === 'active' || alert.status === 'PENDING') : [];
  const highPriorityAlerts = Array.isArray(alerts) ? alerts.filter(alert => (alert.status === 'active' || alert.status === 'PENDING') && alert.severity === 'HIGH') : [];

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              color: darkMode ? '#fff' : '#1a1a1a', 
              mb: 1,
              fontSize: '2rem',
              background: darkMode ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block'
            }}
          >
            🚨 Alert Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#ccc' : '#666', mt: 1 }}>
            Monitor and manage cyberbullying alerts in real-time
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Badge badgeContent={pendingAlerts.length} color="error">
            <Notifications />
          </Badge>
          <Tooltip title="Refresh alerts">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alert Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={pendingAlerts.length} color="error">
                <Notifications color="action" />
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {pendingAlerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Alerts
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Error color="error" />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="error">
                  {highPriorityAlerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle color="success" />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="success">
                  {Array.isArray(alerts) ? alerts.filter(a => a.status === 'resolved' || a.status === 'RESOLVED').length : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Today
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* High Priority Alerts Alert */}
      {highPriorityAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <PriorityHigh />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {highPriorityAlerts.length} High Priority Alert(s) Require Immediate Attention
              </Typography>
              <Typography variant="body2">
                These alerts contain threats or severe harassment and should be reviewed immediately.
              </Typography>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Alerts List */}
      <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Recent Alerts
        </Typography>
        
        {alerts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Active Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All systems are running smoothly. No cyberbullying alerts detected.
            </Typography>
          </Box>
        ) : (
          <List>
            {alerts.map((alert) => (
              <Card key={alert.id} sx={{ mb: 2, border: `2px solid ${alert.severity === 'HIGH' ? '#f44336' : alert.severity === 'MEDIUM' ? '#ff9800' : '#2196f3'}` }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {getSeverityIcon(alert.severity)}
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {alert.type || 'HIGH_RISK_DETECTED'}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                        <Chip
                          label={alert.status}
                          color={alert.status === 'active' || alert.status === 'PENDING' ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        {alert.text || alert.message || 'High-risk content detected'}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2} color="text.secondary">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" />
                          <Typography variant="caption">
                            User {alert.userId || 'Unknown'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule fontSize="small" />
                          <Typography variant="caption">
                            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Unknown time'}
                          </Typography>
                        </Box>
                        {(alert.confidence || alert.result?.confidence) && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption">
                              {((alert.confidence || alert.result?.confidence) * 100).toFixed(1)}% confidence
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(alert)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(alert.status === 'active' || alert.status === 'PENDING') && (
                        <Tooltip title="Resolve Alert">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Paper>

      {/* Alert Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedAlert && getSeverityIcon(selectedAlert.severity)}
            Alert Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {selectedAlert.text || selectedAlert.message || 'High-risk content detected'}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Alert Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={1} sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedAlert.type || 'HIGH_RISK_DETECTED'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Severity:</strong> {selectedAlert.severity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedAlert.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Confidence:</strong> {((selectedAlert.confidence || selectedAlert.result?.confidence) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>User ID:</strong> {selectedAlert.userId || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedAlert.timestamp ? new Date(selectedAlert.timestamp).toLocaleString() : 'Unknown'}
                  </Typography>
                </Box>
              </Box>
              
              {(selectedAlert.resolvedAt || selectedAlert.resolved_at) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resolution Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resolved At:</strong> {new Date(selectedAlert.resolvedAt || selectedAlert.resolved_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resolved By:</strong> {selectedAlert.resolvedBy || 'Unknown'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedAlert && (selectedAlert.status === 'active' || selectedAlert.status === 'PENDING') && (
            <Button
              onClick={() => handleResolveAlert(selectedAlert.id)}
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
            >
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Alerts;