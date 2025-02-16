import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";

// Send password reset request
async function SendPasswordResetApi(email) {
  try {
    if (!email) {
      throw new Error('Email is required to send password reset request.');
    }

    const params = {
      Username: email, // The email of the user requesting the password reset
      ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID, // The Cognito User Pool client ID from your .env file
    };

    const command = new ForgotPasswordCommand(params);
    const response = await cognitoProviderClient.send(command);

    console.log('Password reset request sent successfully:', response);
    return response; // Return the response (success message)
  } catch (error) {
    console.error('Error during password reset request:', error);
    throw error; // Rethrow error for higher-level handling
  }
}

export default SendPasswordResetApi;
