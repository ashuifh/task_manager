import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task Dashboard
      </Typography>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography color="text.secondary">
          Welcome to your task manager! Your tasks will appear here soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
