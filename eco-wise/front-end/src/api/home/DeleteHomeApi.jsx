import EcoWiseApi from "../APIRequest";

export const DeleteHomeApi = async (requestBody) => {
    console.log('reahced', requestBody)
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/Home/DeleteHome', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Deleting home:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };