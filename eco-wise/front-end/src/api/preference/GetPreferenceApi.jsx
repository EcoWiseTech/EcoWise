import EcoWiseApi from "../APIRequestPreference";

export const GetPreferenceApi = async (userId, uuid) => {
    try {
        let response = await EcoWiseApi.get(`/Preference/GetPreference/?userId=${userId}`);
        if (uuid) {
            response = await EcoWiseApi.get(`/Preference/GetPreference/?userId=${userId}&uuid=${uuid}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Preference:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};