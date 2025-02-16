import { UpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function UpdateUserApi({ accessToken, refreshToken, attributes }) {
  try {
    // Transform attributes into Cognito format
    const response = await UpdateUserAction({ accessToken, attributes })
        return response;
  } catch (error) {
    if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
      console.warn("Access token expired. Attempting to refresh...");

      // Refresh access token
      const newTokens = await RefreshTokenApi(refreshToken);
      console.log("New tokens:", newTokens)
      return await UpdateUserAction({
        accessToken: newTokens.accessToken,
        attributes,
      });
    }

    console.error("Error updating user attributes:", error);
    throw error;
  }
}

const UpdateUserAction = async ({ accessToken, attributes }) => {
    const userAttributes = Object.entries(attributes).map(([key, value]) => ({
        Name: key,
        Value: value,
      }));
  
      const params = {
        AccessToken: accessToken,
        UserAttributes: userAttributes,
      };
  
      const command = new UpdateUserAttributesCommand(params);
      const response = await cognitoProviderClient.send(command);
  
      return response;
}

export default UpdateUserApi;

