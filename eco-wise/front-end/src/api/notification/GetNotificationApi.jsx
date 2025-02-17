import EcoWiseApi from "../APIRequest";

export const GetNotificationApi = async (userId) => {
    try {
        let response = await EcoWiseApi.get(`/GetNotification?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting notification Consumption:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};