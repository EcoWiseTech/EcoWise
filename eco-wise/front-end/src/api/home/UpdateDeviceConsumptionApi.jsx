import EcoWiseApi from "../APIRequest";

export const UpdateDeviceConsumptionApi = async (requestBody) => {
    try {
  
      // Make the Put request using the APIRequest class
      const response = await EcoWiseApi.put('/DeviceConsumption/UpdateDeviceConsumption', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Storing Device consumption:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };