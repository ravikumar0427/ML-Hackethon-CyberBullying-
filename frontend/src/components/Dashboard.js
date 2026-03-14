import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  TrendingUp,
  Shield,
  Warning,
  CheckCircle,
  Assessment
} from '@mui/icons-material';
import { getStatistics, getAlerts } from '../services/api';

const Dashboard = ({ darkMode }) => {
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await getStatistics();
        const alertsRes = await getAlerts();
        
        setStats(statsRes.data.statistics || statsRes.data);
        setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : alertsRes.data.alerts || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    
    // Listen for new analysis events
    const handleNewAnalysis = () => {
      fetchData();
    };
    window.addEventListener('newAnalysis', handleNewAnalysis);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('newAnalysis', handleNewAnalysis);
    };
  }, []);

  const cards = [
    {
      title: "Total Analyzed",
      value: stats.totalMessages || 0,
      subtitle: "Messages scanned",
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: "#6366f1",
      change: "+12.4%"
    },
    {
      title: "Flagged",
      value: stats.bullyingDetected || 0,
      subtitle: `${stats.detectionRate || 0}% of total`,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: "#ef4444",
      change: "+2.1%"
    },
    {
      title: "Safe Messages",
      value: stats.safeMessages || 0,
      subtitle: "Clean messages",
      icon: <Shield sx={{ fontSize: 40 }} />,
      color: "#10b981",
      change: "-1.8%"
    },
    {
      title: "Accuracy",
      value: `${stats.accuracy || 0}%`,
      subtitle: "Detection accuracy",
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: "#8b5cf6",
      change: "+0.5%"
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
        Cyberbullying Detection Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Real-time NLP-powered message analysis
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <CardContent>
                  <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                  
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                    <CountUp end={typeof card.value === 'number' ? card.value : 0} duration={2} />
                    {typeof card.value === 'string' && card.value}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 1 }}>{card.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>

                  <Chip 
                    label={card.change} 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 20, 
                      right: 20,
                      backgroundColor: card.color + '20',
                      color: card.color,
                      fontWeight: 'bold'
                    }} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Live Message Feed */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Live Message Feed
        </Typography>

        {alerts.length > 0 ? (
          alerts.slice(0, 3).map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
              <Alert 
                severity="error" 
                sx={{ mb: 2, borderRadius: 2 }}
                icon={<Warning />}
              >
                <strong>Anonymous_User{i+1}</strong>: {alert.text || alert.message}
                <br />
                <small>Confidence: {((alert.confidence || 0.85) * 100).toFixed(0)}% • Harmful terms detected</small>
              </Alert>
            </motion.div>
          ))
        ) : (
          <Typography color="text.secondary" align="center" py={4}>
            No recent threats detected. System is running smoothly.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;