import { SetUserMFAPreferenceCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function DisableMFAApi(accessToken, refreshToken) {
    try {
        const response = await disableMFAAction(accessToken);
        return response;
    } catch (error) {
        console.error("Error disabling MFA:", error);
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");
      
            // Refresh access token
            const newTokens = await RefreshTokenApi(refreshToken);
            return await disableMFAAction(newTokens.accessToken);
          }
        throw error;
    }
}

async function disableMFAAction(accessToken) {
    const params = {
        AccessToken: accessToken,
        SMSMfaSettings: {
            Enabled: false, // Disable SMS MFA
            PreferredMfa: false,
        },
        SoftwareTokenMfaSettings: {
            Enabled: false, // Disable TOTP MFA (if enabled)
            PreferredMfa: false,
        },
    };

    const command = new SetUserMFAPreferenceCommand(params);
    const response = await cognitoProviderClient.send(command);

    console.log("MFA disabled successfully:", response);
    return response;
}

export default DisableMFAApi;
