import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography, Paper } from '@mui/material';
import { Breadcrumbs } from '@mui/material';
import { Link } from 'react-router-dom';
import { useUserContext } from "../contexts/UserContext"; // Import the context
import { CreateTicketApi } from '../api/ticket/CreateTicketApi';


function SubmitTicketRequest() {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext(); // Get user from context

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
        userId: user.Username, // Get email from context
        question,
      };

      CreateTicketApi(ticketData)
        .then((res) => {
          console.log(res)
          console.log("Successful")
        })
        .catch((error) => {
          console.error(error);
        });

    } catch (err) {
      setError('Failed to submit ticket. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box padding={2}>

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
