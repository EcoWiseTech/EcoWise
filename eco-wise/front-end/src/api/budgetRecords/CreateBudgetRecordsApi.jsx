import EcoWiseApi from "../APIRequest";

export const CreateBudgetRecordsApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/BudgetRecords/CreateBudgetRecords', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error creating BudgetRecords:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };