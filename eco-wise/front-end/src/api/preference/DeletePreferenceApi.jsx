import EcoWiseApi from "../APIRequestPreference";

export const DeleteHomeApi = async (requestBody) => {
    console.log('reahced', requestBody)
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/Preference/DeletePreference', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Deleting Preference:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };