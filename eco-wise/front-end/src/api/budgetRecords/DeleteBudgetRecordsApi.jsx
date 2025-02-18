import EcoWiseApi from "../APIRequest";

export const DeleteBudgetRecordsApi = async (requestBody) => {
    console.log('reahced', requestBody)
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/BudgetRecords/DeleteBudgetRecords', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error Deleting BudgetRecords:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };