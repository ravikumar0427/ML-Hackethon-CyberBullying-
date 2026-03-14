import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Search,
  Security,
  CheckCircle,
  Refresh,
  FilterList,
  Download,
  Visibility
} from '@mui/icons-material';
import { getHistory } from '../services/api';

const History = ({ darkMode }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    // Listen for new analysis events
    const handleNewAnalysis = () => {
      fetchHistory();
    };
    window.addEventListener('newAnalysis', handleNewAnalysis);
    return () => {
      clearInterval(interval);
      window.removeEventListener('newAnalysis', handleNewAnalysis);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (newFilter) => {
    setFilter(newFilter);
    setAnchorEl(null);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'bullying' && item.is_bullying) ||
      (filter === 'safe' && !item.is_bullying);
    return matchesSearch && matchesFilter;
  });

  const paginatedHistory = filteredHistory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const exportData = () => {
    const csvContent = [
      ['Message', 'Result', 'Confidence', 'Date', 'Time'],
      ...filteredHistory.map(item => [
        item.text || 'N/A',
        item.is_bullying ? 'Cyberbullying' : 'Safe',
        item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A',
        item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A',
        item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberbullying_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            📊 Analysis History
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#ccc' : '#666', mt: 1 }}>
            Complete log of message analyses with detailed insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export to CSV">
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportData}
              disabled={filteredHistory.length === 0}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
            >
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

      <Paper sx={{ p: 3, mb: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{ minWidth: 120 }}
          >
            {filter === 'all' ? 'All' : filter === 'bullying' ? 'Flagged' : 'Safe'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleFilterClose(filter)}
          >
            <MenuItem onClick={() => handleFilterClose('all')}>All Messages</MenuItem>
            <MenuItem onClick={() => handleFilterClose('bullying')}>Flagged Only</MenuItem>
            <MenuItem onClick={() => handleFilterClose('safe')}>Safe Only</MenuItem>
          </Menu>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Message</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistory.map((item, index) => (
                <TableRow key={item.id || index} hover>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.text || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={item.is_bullying ? <Security /> : <CheckCircle />}
                      label={item.is_bullying ? 'Cyberbullying' : 'Safe'}
                      color={item.is_bullying ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View details">
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredHistory.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || filter !== 'all' 
                ? 'No messages found matching your criteria.' 
                : 'No analysis history available.'}
            </Typography>
          </Box>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Summary Statistics
            </Typography>
            <Box display="flex" gap={4} flexWrap="wrap">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Messages
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {filteredHistory.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Cyberbullying Detected
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error">
                  {filteredHistory.filter(item => item.is_bullying).length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Safe Messages
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {filteredHistory.filter(item => !item.is_bullying).length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Detection Rate
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {filteredHistory.length > 0 
                    ? `${((filteredHistory.filter(item => item.is_bullying).length / filteredHistory.length) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Quick Insights
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Most Active Time:</strong> Afternoon (2-4 PM)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Average Confidence:</strong> {filteredHistory.length > 0 
                  ? `${(filteredHistory.reduce((sum, item) => sum + (item.confidence || 0), 0) / filteredHistory.length * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>High Risk Messages:</strong> {filteredHistory.filter(item => item.is_bullying && item.confidence > 0.8).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default History;