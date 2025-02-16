import EcoWiseApi from "../APIRequest";

export const UpdateHomeApi = async (requestBody) => {
    console.log('reahced', requestBody)
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.put('/Home/UpdateHome', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Updating home:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };