import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Fade
} from '@mui/material';
import { motion } from 'framer-motion';
import { Security, Lock, Email } from '@mui/icons-material';
import { login } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      authLogin(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '10%',
          left: '10%',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 150,
          height: 150,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          bottom: '20%',
          right: '15%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      <Container component="main" maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Avatar
              sx={{
                mb: 2,
                width: 64,
                height: 64,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                boxShadow: '0 6px 24px rgba(102, 126, 234, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              <Security sx={{ fontSize: 32 }} />
            </Avatar>
            
            <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CyberGuard
            </Typography>
            <Typography component="h2" variant="h6" sx={{ mb: 3, color: '#666', fontWeight: 400 }}>
              Advanced Cyberbullying Detection
            </Typography>
            <Typography component="h3" variant="subtitle1" sx={{ mb: 4, color: '#888' }}>
              Sign In to Your Account
            </Typography>
            
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: '#667eea' }} />,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      color: '#333',
                      '& fieldset': {
                        borderColor: 'rgba(0,0,0,0.3)',
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
                      color: '#333',
                      fontSize: '1rem',
                    },
                  }
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#666',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#667eea' }} />,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      color: '#333',
                      '& fieldset': {
                        borderColor: 'rgba(0,0,0,0.3)',
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
                      color: '#333',
                      fontSize: '1rem',
                    },
                  }
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#666',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
                  },
                  transition: 'all 0.3s ease'
                }}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Button
                    variant="text"
                    sx={{ 
                      color: '#667eea',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)',
                      }
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Don't have an account? Sign Up
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default Login;
