import axios from 'axios';

export class APIRequest {
    constructor(baseURL) {
        // Set up base URL for your API requests
        this.apiClient = axios.create({
            baseURL: baseURL,  // Your API base URL
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers here (like Authorization token)
            },
        });
    }

    // Generic method to handle GET requests
    async get(endpoint, params = {}) {
        try {
            const response = await this.apiClient.get(endpoint, { params });
            return response
        } catch (error) {
            throw error 
        }
    }

    // Generic method to handle POST requests
    async post(endpoint, data) {
        try {
            const response = await this.apiClient.post(endpoint, data);
            return response
        } catch (error) {
            throw error
        }
    }

    // Generic method to handle PUT requests
    async put(endpoint, data) {
        try {
            const response = await this.apiClient.put(endpoint, data);
            return response
        } catch (error) {
            throw error
        }
    }

    // Generic method to handle DELETE requests
    async delete(endpoint, data) {
        try {
            const response = await this.apiClient.delete(endpoint, data);
            return response
        } catch (error) {
            throw error
        }
    }
    
    // Add this method in your APIRequest class
    async getAllTickets(endpoint) {
        try {
            const response = await this.apiClient.get(endpoint);
            return response.data; // Assuming the API returns the data in the response body
        } catch (error) {
            throw error;
        }
    }
}

const EcoWiseApi = new APIRequest("https://rxxv79xuo8.execute-api.us-east-1.amazonaws.com/dev")

export default EcoWiseApi;
