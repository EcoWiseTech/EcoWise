import EcoWiseApi from "./APIRequest";
export const ViewTicketsApi = async () => {
    try {
        let response = await EcoWiseApi.get(`/retrieveAllTickets`);
        // Return the successful response
        console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error getting Tickets:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};