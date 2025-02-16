import EcoWiseApi from "../APIRequest";

export const StoreDeviceConsumptionApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/DeviceConsumption/StoreDeviceConsumption', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Storing Device consumption:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };