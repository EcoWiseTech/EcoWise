import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Pagination,
  Button,
  TextField,
} from '@mui/material';
import { ViewTicketsApi } from '../api/ticket/ViewTicketsApi';
import { UpdateSupportTicketApi } from '../api/ticket/UpdateSupportTicketApi';
import { useUserContext } from "../contexts/UserContext"; // Import the context
import { useNavigate } from 'react-router-dom';

function ViewTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Current page
  const [editingResponseId, setEditingResponseId] = useState(null); // Track which ticket's response is being edited
  const [editedResponse, setEditedResponse] = useState(''); // Store the edited response
  const itemsPerPage = 10; // Number of tickets per page
  const { user } = useUserContext(); // Get user from context
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all tickets on component mount
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ViewTicketsApi(); // Make sure the endpoint matches
        const parsedResponse = JSON.parse(response.body); // Parse the JSON string in the body

        // Filter tickets to only include those for the current user's email
        const userEmail = user.UserAttributes.email; // Get the current user's email
        const filteredTickets = parsedResponse.items.filter(
          (ticket) => ticket.customerEmail === userEmail
        );
        const sortedTickets = filteredTickets.sort((a, b) => b.ID.localeCompare(a.ID));

        setTickets(sortedTickets); // Store the filtered tickets in state
      } catch (error) {
        setError('Failed to fetch tickets.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]); // Re-fetch tickets if the user changes

  // Calculate the tickets to display for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle edit button click
  const handleEditClick = (ticketId, currentResponse) => {
    setEditingResponseId(ticketId); // Set the ticket ID being edited
    setEditedResponse(currentResponse); // Set the current response for editing
  };

  // Handle save button click
  const handleSaveClick = async (ticketId) => {
    try {
      // Call the API to update the response in the backend
      const response = await UpdateSupportTicketApi(ticketId, editedResponse);

      if (response.ok) {
        // Update the ticket's response in the state
        const updatedTickets = tickets.map((ticket) =>
          ticket.ID === ticketId ? { ...ticket, response: editedResponse } : ticket
        );
        setTickets(updatedTickets); // Update state
        setEditingResponseId(null); // Exit edit mode
      } else {
        console.error("Failed to update ticket response:");
        console.log(response);
      }
    } catch (error) {
      console.error("Error updating ticket response:", error);
    }
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    setEditingResponseId(null); // Exit edit mode
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Support Tickets
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/submitTicketRequest')}
        sx={{ marginBottom: 2 }}
      >
        Submit Ticket Request
      </Button>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket ID</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTickets.map((ticket) => (
              <TableRow key={ticket.ID}>
                <TableCell>{ticket.ID}</TableCell>
                <TableCell>{ticket.question}</TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>
                  {editingResponseId === ticket.ID ? (
                    <TextField
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  ) : (
                    ticket.response || 'No response yet'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <Box display="flex" justifyContent="center" my={3}>
          <Pagination
            count={Math.ceil(tickets.length / itemsPerPage)} // Total number of pages
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default ViewTickets;