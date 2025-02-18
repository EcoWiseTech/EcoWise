import EcoWiseApi from "./APIRequest";

export const DeleteTicketApi = async (requestBody) => {
  console.log('DeleteTicketApi called with ticketId:', requestBody);

  try {
    // Send the ticketId in the request body

      const response = await EcoWiseApi.post('/deleteSupportTicket', requestBody);

    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};
