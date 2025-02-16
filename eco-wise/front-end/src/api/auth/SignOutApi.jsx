import { GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function SignOutApi(accessToken, refreshToken) {
  try {
    const response = await SignOutFunction(accessToken);
  } catch (error) {
    console.error('Error during sign-out:', error);
    if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
      console.warn("Access token expired. Attempting to refresh...");

      // Refresh access token
      const newTokens = await RefreshTokenApi(refreshToken);
      return await SignOutFunction(newTokens.accessToken);
    }
    throw error; // Rethrow error for higher-level handling
  }
}

const SignOutFunction = async (accessToken) => {
  if (!accessToken) {
    throw new Error('Access token is required to sign out.');
  }

  const params = {
    AccessToken: accessToken, // The token for the user to sign out
  };

  const command = new GlobalSignOutCommand(params);
  const response = await cognitoProviderClient.send(command);

  console.log('Sign-out successful:', response);
  return response;
}

export default SignOutApi;
