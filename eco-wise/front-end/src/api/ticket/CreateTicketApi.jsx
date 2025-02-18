import EcoWiseApi from "./APIRequest";

export const CreateTicketApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/submitTicket', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error creating Preference:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };