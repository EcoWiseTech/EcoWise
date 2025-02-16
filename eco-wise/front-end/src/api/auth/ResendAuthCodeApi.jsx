import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider"; // Import SDK v3 components
import cognitoProviderClient from "./AwsCognitoInit";

async function ResendAuthCodeApi(email) {
    try {
        // Define the parameters for the resend confirmation code request
        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
            Username: email, // The username (email in this case)
        };

        // Create the command using the provided parameters
        const command = new ResendConfirmationCodeCommand(params);

        // Send the request and wait for the response
        const response = await cognitoProviderClient.send(command);

        return response; // Return the response containing the confirmation code details
    } catch (error) {
        console.error('Error during resend auth code:', error);
        throw error; // Rethrow error to be handled by the calling function
    }
}

export default ResendAuthCodeApi;
