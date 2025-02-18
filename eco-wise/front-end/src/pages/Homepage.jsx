import React from 'react';
import { Container, Grid, Typography, Card, CardContent, Button, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';

// Styled components for better customization
const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: 8,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const TipBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5),
  padding: theme.spacing(3),
  backgroundColor: '#e8f5e9',
  borderRadius: 8,
  boxShadow: theme.shadows[2],
}));

const Homepage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 'bold', color: '#2d6a4f' }}>
        Welcome to EcoWise 🌿
      </Typography>

      {/* Intro and Feature Sections */}
      <Grid container spacing={6}>
        {/* Intro Section */}
        <Grid item xs={12} md={6}>
          <FeatureCard>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Save Energy. Save the Planet.
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                EcoWise helps you track and reduce your energy usage while offering personalized tips to save more. Start making a positive impact today and be part of the change!
              </Typography>
              <Button variant="contained" color="primary" sx={{ width: '100%' }}>
                Get Started
              </Button>
            </CardContent>
          </FeatureCard>
        </Grid>

        {/* Feature Section */}
        <Grid item xs={12} md={6}>
          <FeatureCard>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Key Features:
            </Typography>
            <ul>
              <li>Track device energy consumption</li>
              <li>Get weather-based energy-saving tips</li>
              <li>Monitor your progress and reduce your carbon footprint</li>
              <li>Set energy-saving goals and challenge your friends</li>
            </ul>
          </FeatureCard>
        </Grid>
      </Grid>

      {/* Energy Saving Tips Section */}
      <TipBox>
        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }} gutterBottom>
          Energy Saving Tip of the Day 🌱
        </Typography>
        <Typography variant="body1" align="center" sx={{ fontSize: 18 }}>
          Did you know? Even when turned off, many appliances still consume energy in standby mode. Make it a habit to unplug devices when not in use to save energy and reduce your bills!
        </Typography>
      </TipBox>

      {/* Statistics Section */}
      <Grid container spacing={6} sx={{ mt: 6 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" color="primary">
              15%
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Average energy savings per user after 1 month
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" color="primary">
              500+
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Homes actively reducing energy usage
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" color="primary">
              1.2M+
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Pounds of CO2 saved by EcoWise users so far
            </Typography>
          </Paper>
        </Grid>
      </Grid>


    </Container>
  );
};

export default Homepage;
