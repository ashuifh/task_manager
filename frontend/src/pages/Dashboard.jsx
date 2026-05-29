import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('user');
    if (!userInfo) {
      navigate('/auth');
    } else {
      setUser(JSON.parse(userInfo));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Task Dashboard
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography color="text.secondary">
          This is where you will manage your tasks. Task features coming soon...
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
