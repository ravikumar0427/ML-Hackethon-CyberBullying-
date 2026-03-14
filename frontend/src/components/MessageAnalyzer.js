import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Send,
  Security,
  CheckCircle,
  Info,
  Refresh,
  Warning,
  PriorityHigh,
  Visibility,
  Category
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { analyzeMessage, getHistory } from '../services/api';

const MessageAnalyzer = ({ darkMode }) => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch recent history from backend
  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const response = await getHistory();
        const recent = response.data.slice(0, 5); // Get last 5 items
        setAnalysisHistory(recent);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchRecentHistory();
  }, [refreshTrigger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await analyzeMessage({ text: message });
      setResult(response.data);
      
      // Show success message if analysis was saved
      if (response.data.alertCreated) {
        setShowSuccess(true);
      }
      
      setMessage('');
      
      // Refresh history to show new analysis
      setRefreshTrigger(prev => prev + 1);
      
      // Emit custom event to notify other components
      window.dispatchEvent(new CustomEvent('newAnalysis', { 
        detail: { analysis: response.data } 
      }));
      
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        is_bullying: false,
        message: 'Error analyzing message. Please try again.',
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.7) return '#f44336';
    if (confidence > 0.4) return '#ff9800';
    return '#4caf50';
  };

  const handleRefreshHistory = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: darkMode ? '#fff' : '#333' }}>
        Message Analyzer
      </Typography>

      <Paper sx={{ p: 4, mb: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff' }}>
        <Typography variant="body1" sx={{ mb: 3, color: darkMode ? '#ccc' : '#666' }}>
          Enter a message to analyze for potential cyberbullying content.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message to analyze for cyberbullying content..."
            disabled={loading}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: darkMode ? '#fff' : '#333',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                },
              },
              '& .MuiInputBase-input': {
                color: darkMode ? '#fff' : '#333',
                fontSize: '1rem',
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#ccc' : '#666',
                '&.Mui-focused': {
                  color: '#667eea',
                },
              },
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderRadius: 2,
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !message.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{ 
              py: 1.5, 
              px: 4,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Message'}
          </Button>
        </form>
      </Paper>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderLeft: `4px solid ${result.is_bullying ? '#f44336' : '#4caf50'}`,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              {result.is_bullying ? (
                <Security sx={{ fontSize: 32, color: '#f44336', mr: 2 }} />
              ) : (
                <CheckCircle sx={{ fontSize: 32, color: '#4caf50', mr: 2 }} />
              )}
              <Typography variant="h6">
                {result.is_bullying ? 'Cyberbullying Detected' : 'Message is Safe'}
              </Typography>
              {result.severity && (
                <Chip
                  label={`${result.severity} SEVERITY`}
                  color={result.severity === 'HIGH' ? 'error' : result.severity === 'MEDIUM' ? 'warning' : 'info'}
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            <Alert
              severity={result.is_bullying ? 'error' : 'success'}
              sx={{ mb: 2 }}
            >
              {result.message}
            </Alert>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Confidence Level
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      backgroundColor: '#e0e0e0',
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(result.confidence || 0) * 100}%`,
                        height: '100%',
                        backgroundColor: getConfidenceColor(result.confidence || 0),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                    {((result.confidence || 0) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>

              {result.category && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Detection Category
                  </Typography>
                  <Chip
                    icon={<Category />}
                    label={result.category.replace('_', ' ').toUpperCase()}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            {/* Detailed Analysis */}
            {result.details && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Detailed Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Toxic Words Detected
                    </Typography>
                    <Typography variant="h6" color="error">
                      {result.details.toxic_words_detected || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Safe Words Detected
                    </Typography>
                    <Typography variant="h6" color="success">
                      {result.details.safe_words_detected || 0}
                    </Typography>
                  </Grid>
                </Grid>

                {result.details.category_counts && Object.keys(result.details.category_counts).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Category Breakdown
                    </Typography>
                    <List dense>
                      {Object.entries(result.details.category_counts).map(([category, count]) => (
                        count > 0 && (
                          <ListItem key={category} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Visibility fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={category.replace('_', ' ').title()}
                              secondary={`${count} word${count !== 1 ? 's' : ''} detected`}
                            />
                          </ListItem>
                        )
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {result.alertCreated && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PriorityHigh />
                  <Typography variant="body2">
                    High-risk content detected! Alert has been created for moderator review.
                  </Typography>
                </Box>
              </Alert>
            )}
          </Paper>
        </motion.div>
      )}

      {analysisHistory.length > 0 && (
        <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Recent Analysis (Connected to History)
            </Typography>
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefreshHistory}
            >
              Refresh
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These are your most recent analyses saved to your history. View full history in the History tab.
          </Typography>
          <Box>
            {analysisHistory.map((item, index) => (
              <Box
                key={item.id || index}
                sx={{
                  py: 2,
                  borderBottom: index < analysisHistory.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {item.text}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    icon={item.is_bullying ? <Security /> : <CheckCircle />}
                    label={item.is_bullying ? 'Cyberbullying' : 'Safe'}
                    color={item.is_bullying ? 'error' : 'success'}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                  </Typography>
                  {item.confidence && (
                    <Typography variant="caption" color="text.secondary">
                      • {(item.confidence * 100).toFixed(1)}% confidence
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Analysis saved to history successfully!"
      />

      <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Info color="action" />
          <Typography variant="body2" color="text.secondary">
            This system uses machine learning to detect potential cyberbullying. Results should be reviewed by human moderators.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageAnalyzer;