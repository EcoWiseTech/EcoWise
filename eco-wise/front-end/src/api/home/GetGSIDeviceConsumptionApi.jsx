import EcoWiseApi from "../APIRequest";

export const GetGSIDeviceConsumptionApi = async (userId, startTime) => {
    try {
        let response = await EcoWiseApi.get(`/DeviceConsumption/GetGSIDeviceConsumption/?userId=${userId}`);
        if (startTime) {
            response = await EcoWiseApi.get(`/Home/GetHome/?userId=${userId}&startTime=${startTime}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Device Consumption:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};