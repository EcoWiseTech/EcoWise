import EcoWiseApi from "../APIRequest";

export const GetHomeApi = async (userId, uuid) => {
    try {
        let response = await EcoWiseApi.get(`/Home/GetHome/?userId=${userId}`);
        if (uuid) {
            response = await EcoWiseApi.get(`/Home/GetHome/?userId=${userId}&uuid=${uuid}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting home:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};