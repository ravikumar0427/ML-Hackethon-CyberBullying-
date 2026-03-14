import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Assessment,
  Timeline,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { getStatistics } from '../services/api';

const StatCard = ({ title, value, subtitle, icon, trend, color }) => (
  <Card
    sx={{
      height: '100%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 12px rgba(0,0,0,0.15)'
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 2 }}>{icon}</Box>
        <Box sx={{ ml: 'auto' }}>
          {trend && (
            <Chip
              label={trend}
              size="small"
              color={trend.startsWith('+') ? 'success' : 'error'}
              sx={{ mb: 1 }}
            />
          )}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const CategoryProgress = ({ label, value, total, color }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2">{value} cases</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={total > 0 ? (value / total) * 100 : 0}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        '& .MuiLinearProgress-bar': {
          backgroundColor: color
        }
      }}
    />
  </Box>
);

const Statistics = ({ darkMode }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await getStatistics();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Messages',
      value: stats?.totalMessages || 0,
      subtitle: 'Messages analyzed',
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      trend: '+12%',
      color: '#667eea'
    },
    {
      title: 'Cyberbullying Detected',
      value: stats?.bullyingDetected || 0,
      subtitle: `${stats?.detectionRate || 0}% detection rate`,
      icon: <Warning sx={{ fontSize: 32 }} />,
      trend: '+5%',
      color: '#f44336'
    },
    {
      title: 'Safe Messages',
      value: stats?.safeMessages || 0,
      subtitle: 'Clean content',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      trend: '+15%',
      color: '#4caf50'
    },
    {
      title: 'Model Accuracy',
      value: `${stats?.accuracy || 0}%`,
      subtitle: 'Detection precision',
      icon: <Assessment sx={{ fontSize: 32 }} />,
      trend: '+2.3%',
      color: '#ff9800'
    }
  ];

  const totalCategories = Object.values(stats?.categories || {}).reduce((sum, val) => sum + val, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: darkMode ? '#fff' : '#333' }}>
        Statistics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Real-time cyberbullying detection metrics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              System Performance
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Model Accuracy: {stats?.accuracy || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(stats?.accuracy || 0)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Response Time: {stats?.responseTime || 0}s
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (1 - parseFloat(stats?.responseTime || 1)) * 100)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#667eea'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Average Confidence: {stats?.avgConfidence || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(stats?.avgConfidence || 0)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff9800'
                  }
                }}
              />
            </Box>

            <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>System Health:</strong> All systems operational
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Detection Categories
            </Typography>
            <Box>
              <CategoryProgress
                label="Verbal Abuse"
                value={stats?.categories?.verbal || 0}
                total={totalCategories}
                color="#f44336"
              />
              <CategoryProgress
                label="Threats"
                value={stats?.categories?.threats || 0}
                total={totalCategories}
                color="#ff9800"
              />
              <CategoryProgress
                label="Harassment"
                value={stats?.categories?.harassment || 0}
                total={totalCategories}
                color="#9c27b0"
              />
              <CategoryProgress
                label="Hate Speech"
                value={stats?.categories?.hateSpeech || 0}
                total={totalCategories}
                color="#e91e63"
              />
              <CategoryProgress
                label="Other"
                value={stats?.categories?.other || 0}
                total={totalCategories}
                color="#607d8b"
              />
            </Box>
            
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Total Categories: {totalCategories}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on detected patterns
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;