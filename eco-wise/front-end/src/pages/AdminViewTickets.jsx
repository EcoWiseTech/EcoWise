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
import { DeleteTicketApi } from '../api/ticket/DeleteTicketApi';

function AdminViewTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Current page
  const [editingResponseId, setEditingResponseId] = useState(null); // Track which ticket's response is being edited
  const [editedResponse, setEditedResponse] = useState(''); // Store the edited response
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Answered', or 'Open'
  const itemsPerPage = 10; // Number of tickets per page

  useEffect(() => {
    // Fetch all tickets on component mount
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ViewTicketsApi(); // Make sure the endpoint matches
        const parsedResponse = JSON.parse(response.body); // Parse the JSON string in the body

        // Log the tickets to debug their structure
        console.log('Fetched tickets:', parsedResponse.items);

        // Set all tickets (no filtering)
        const sortedTickets = parsedResponse.items.sort((a, b) => b.ID.localeCompare(a.ID));

        setTickets(sortedTickets); // Store the filtered tickets in state
      } catch (error) {
        setError('Failed to fetch tickets.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // No dependency on user

  // Filter tickets based on status
  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus === 'All') return true;
    return ticket.status === filterStatus;
  });

  // Calculate the tickets to display for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

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

      if (response.statusCode === 200) {
        // Update the ticket's response in the state
        const updatedTickets = tickets.map((ticket) =>
          ticket.ID === ticketId ? { ...ticket, status: "Answered", response: editedResponse } : ticket
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

  // Handle delete button click
  const handleDeleteClick = async (ticketId) => {
    try {
      let requestBody = {
        ticketId: ticketId,
      };
      requestBody = {
        body: JSON.stringify({ ticketId: ticketId }),
      };
      console.log(requestBody);
      DeleteTicketApi(requestBody)
        .then((res) => {
          // Remove the deleted ticket from the state
          const updatedTickets = tickets.filter((ticket) => ticket.ID !== ticketId);
          setTickets(updatedTickets); // Update the state
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
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
        Admin Support Tickets
      </Typography>

      {/* Filter Buttons */}
      <Box sx={{ marginBottom: 2 }}>
        <Button
          variant={filterStatus === 'All' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('All')}
          sx={{ mr: 1 }}
        >
          All
        </Button>
        <Button
          variant={filterStatus === 'Answered' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('Answered')}
          sx={{ mr: 1 }}
        >
          Answered
        </Button>
        <Button
          variant={filterStatus === 'Open' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('Open')}
        >
          Open
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Response</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTickets.map((ticket) => (
              <TableRow key={ticket.ID}>
                <TableCell>{ticket.ID}</TableCell>
                <TableCell>{ticket.customerEmail}</TableCell>
                <TableCell>{ticket.question}</TableCell>
                <TableCell>
                  {typeof ticket.status === 'object'
                    ? JSON.stringify(ticket.status) // Convert object to string
                    : ticket.status || 'No status'}
                </TableCell>
                <TableCell>
                  {editingResponseId === ticket.ID ? (
                    <TextField
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  ) : (
                    typeof ticket.response === 'object'
                      ? JSON.stringify(ticket.response) // Convert object to string
                      : ticket.response || 'No response yet'
                  )}
                </TableCell>
                <TableCell>
                  {editingResponseId === ticket.ID ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveClick(ticket.ID)}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditClick(ticket.ID, ticket.response)}
                        sx={{ mr: 1 }}
                      >
                        Answer
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(ticket.ID)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <Box display="flex" justifyContent="center" my={3}>
          <Pagination
            count={Math.ceil(filteredTickets.length / itemsPerPage)} // Total number of pages
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminViewTickets;