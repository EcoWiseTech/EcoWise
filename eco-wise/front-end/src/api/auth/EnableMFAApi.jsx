import { SetUserMFAPreferenceCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function EnableMFAApi(accessToken, refreshToken) {
    try {
        // Attempt to enable MFA
        return await enableMFAAction(accessToken);
    } catch (error) {
        console.error("Error enabling MFA:", error);

        // Handle access token expiry
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");

            // Refresh access token
            const newTokens = await RefreshTokenApi(refreshToken);

            // Retry enabling MFA with refreshed token
            return await enableMFAAction(newTokens.accessToken);
        }

        // Re-throw other errors
        throw error;
    }
}

const enableMFAAction = async (accessToken) => {

    const params = { 
        AccessToken: accessToken, 
        SMSMfaSettings: { 
          Enabled: true ,
          PreferredMfa: true 
        },
        SoftwareTokenMfaSettings: { 
          Enabled: false,
          PreferredMfa: false,
        },
        EmailMfaSettings: { 
          Enabled: false,
          PreferredMfa: false
        },
      };

    const command = new SetUserMFAPreferenceCommand(params);
    const response = await cognitoProviderClient.send(command);

    console.log("MFA enabled successfully:", response);
    return response;
};

export default EnableMFAApi;
