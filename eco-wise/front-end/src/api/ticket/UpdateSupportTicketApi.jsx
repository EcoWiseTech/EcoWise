import EcoWiseApi from "./APIRequest";

export const UpdateSupportTicketApi = async (ticketID, editedResponse) => {
    try {
        let response = await EcoWiseApi.put(`/editSupportTicket`, {
            body: JSON.stringify({
                ticketId: ticketID,
                response: editedResponse
            })
        });

        console.log("API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error editing Tickets:", error);
        throw error;
    }
};
