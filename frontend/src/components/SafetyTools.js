import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Security,
  Report,
  Shield,
  Lock,
  School,
  FamilyRestroom,
  SupportAgent,
  HealthAndSafety
} from '@mui/icons-material';

const SafetyTools = ({ darkMode }) => {
  const [loading, setLoading] = useState(false);

  const tools = [
    {
      name: 'Report Incident',
      type: 'REPORTING',
      description: 'Report cyberbullying incidents safely and anonymously',
      icon: <Report color="error" />
    },
    {
      name: 'Protection Tools',
      type: 'PROTECTION', 
      description: 'Protect yourself from harmful content and interactions',
      icon: <Shield color="warning" />
    },
    {
      name: 'Privacy Settings',
      type: 'PRIVACY',
      description: 'Control your privacy and manage your digital footprint',
      icon: <Lock color="info" />
    },
    {
      name: 'Safety Education',
      type: 'EDUCATION',
      description: 'Learn about online safety and digital citizenship',
      icon: <School color="success" />
    },
    {
      name: 'Parental Controls',
      type: 'PARENTAL',
      description: 'Monitor and protect your children online',
      icon: <FamilyRestroom color="primary" />
    },
    {
      name: 'Support Center',
      type: 'SUPPORT',
      description: 'Get help when you need it most',
      icon: <SupportAgent color="secondary" />
    }
  ];

  return (
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
        🛡️ Safety Tools & Resources
      </Typography>
      <Typography variant="body1" sx={{ color: darkMode ? '#fff' : '#333', mb: 4 }}>
        Comprehensive protection and support for a safer online experience
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <HealthAndSafety />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: darkMode ? '#fff' : '#333' }}>
              Your Safety is Our Priority
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666' }}>
              Use these tools to protect yourself and others from online harm.
            </Typography>
          </Box>
        </Box>
      </Alert>

      <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            color: darkMode ? '#fff' : '#1a1a1a',
            background: darkMode ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            padding: '4px 8px',
            borderRadius: '8px',
            display: 'inline-block'
          }}
        >
          🛠️ Safety Tools
        </Typography>
        <Grid container spacing={3}>
          {tools.map((tool, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {tool.icon}
                    <Chip
                      label={tool.type}
                      size="small"
                      sx={{ ml: 'auto' }}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: darkMode ? '#fff' : '#333' }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666' }}>
                    {tool.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Use Tool
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default SafetyTools;