import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Typography, Paper } from '@mui/material';
import { useUserContext } from "../contexts/UserContext"; // Import the context
import { CreateTicketApi } from '../api/ticket/CreateTicketApi';

function SubmitTicketRequest() {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state
  const { user } = useUserContext(); // Get user from context

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  // Submit ticket handler
  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        customerEmail: user.UserAttributes.email, // Get email from context
        userId: user.Username, // Get username from context
        question,
      };

      const response = await CreateTicketApi(ticketData);
      console.log("API Response:", response);

      if (response.statusCode === 200) {
        setNotification({ message: 'Ticket submitted successfully!', type: 'success' }); // Show success notification
        setQuestion(''); // Clear the input field
        setError(''); // Clear any previous errors
      } else {
        setNotification({ message: 'Failed to submit ticket. Please try again.', type: 'error' }); // Show error notification
      }
    } catch (err) {
      setNotification({ message: 'Failed to submit ticket. Please try again.', type: 'error' }); // Show error notification
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for the notification
  const notificationStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    borderRadius: '4px',
    color: '#fff',
    backgroundColor: notification.type === 'success' ? '#4CAF50' : '#F44336',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };

  return (
    <>
      <Box padding={2}>
        {/* Notification */}
        {notification.message && (
          <div style={notificationStyles}>
            {notification.message}
          </div>
        )}

        <Grid container direction="column" spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h5" gutterBottom>
                Submit a Support Ticket
              </Typography>

              {/* Ticket Submission Form */}
              <TextField
                fullWidth
                label="Enter your question"
                variant="outlined"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                multiline
                rows={4}
                error={Boolean(error)}
                helperText={error}
                sx={{ mb: 2 }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default SubmitTicketRequest;