import EcoWiseApi from "../APIRequestPreference";

export const UpdatePreferenceApi = async (requestBody) => {
    console.log('reahced', requestBody)
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.put('/Preference/UpdatePreference', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Updating Preference:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };