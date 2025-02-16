import EcoWiseApi from "../APIRequest";

export const GetDeviceConsumptionApi = async (deviceId, sessionId) => {
    try {
        let response = await EcoWiseApi.get(`/DeviceConsumption/GetDeviceConsumption/?deviceId=${deviceId}`);
        if (sessionId) {
            response = await EcoWiseApi.get(`/Home/GetHome/?deviceId=${deviceId}&sessionId=${sessionId}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Device Consumption:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};