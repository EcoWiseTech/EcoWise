import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider"; // Import SDK v3 components
import cognitoProviderClient from "./AwsCognitoInit";

async function GetCurrentUserApi(token) {
  try {
    if (!token) {
      throw new Error('Access token is required to fetch user data.');
    }

    // Define the parameters for the GetUser request
    const params = {
      AccessToken: token, // The access token required for getting user data
    };

    // Create the command using the provided parameters
    const command = new GetUserCommand(params);

    // Send the request and wait for the response
    const data = await cognitoProviderClient.send(command);
    console.log('userdata', data)
    return data; // Return the user data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // Rethrow the error for higher-level handling
  }
}

export default GetCurrentUserApi;
