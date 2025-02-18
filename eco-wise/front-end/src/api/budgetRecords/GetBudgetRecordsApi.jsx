import EcoWiseApi from "../APIRequest";

export const GetBudgetRecordsApi = async (userId, uuid) => {
    try {
        let response = await EcoWiseApi.get(`/BudgetRecords/GetBudgetRecords/?userId=${userId}`);
        if (uuid) {
            response = await EcoWiseApi.get(`/BudgetRecords/GetBudgetRecords/?userId=${userId}&uuid=${uuid}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting BudgetRecords:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};