import axios from 'axios';

const baseAPIUrl = "https://w5o98xbbtf.execute-api.us-east-1.amazonaws.com/Prod/";

const GetWeatherDataApi = async () => {
  const endpoint = `${baseAPIUrl}/GetWeatherApi`;

  try {
    const response = await axios.get(endpoint);

    if (response.status === 200) {
      console.log("Weather data fetched successfully:", response.data);
      return response.data; // Return the data for further processing if needed
    } else {
      console.error(`Unexpected response status: ${response.status}`);
      throw new Error("Unexpected response status from API.");
    }
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside the range of 2xx
      console.error("Error response from server:", error.response.data);
      console.error("Status code:", error.response.status);
      throw new Error(
        `API responded with an error: ${error.response.data.message || error.response.statusText}`
      );
    } else if (error.request) {
      // No response received from the server
      console.error("No response received:", error.request);
      throw new Error("No response received from API.");
    } else {
      // Error in setting up the request
      console.error("Error setting up request:", error.message);
      throw new Error("Error in making the API request.");
    }
  }
};

export default GetWeatherDataApi;
