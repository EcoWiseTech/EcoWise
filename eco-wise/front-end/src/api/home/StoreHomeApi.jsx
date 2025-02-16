import EcoWiseApi from "../APIRequest";

export const StoreHomeApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/Home/StoreHome', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error creating home:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };