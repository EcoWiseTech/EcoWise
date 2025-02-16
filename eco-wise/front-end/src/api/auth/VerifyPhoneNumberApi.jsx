import { VerifyUserAttributeCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function VerifyPhoneNumberApi(accessToken, code) {
    try {
        const response = await verifyPhoneNumberAction(accessToken, code)
        return response;
    } catch (error) {
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");
      
            // Refresh access token
            const newTokens = await RefreshTokenApi(accessToken);
            return await verifyPhoneNumberAction(newTokens.accessToken, code)
          }
        console.error("Error verifying phone number:", error);
        throw error;
    }
}

const verifyPhoneNumberAction = async (accessToken, code) => {
    const params = {
        AccessToken: accessToken,
        AttributeName: "phone_number", // Attribute to verify
        Code: code, // Verification code from SMS
    };

    const command = new VerifyUserAttributeCommand(params);
    const response = await cognitoProviderClient.send(command);

    return response;
}

export default VerifyPhoneNumberApi;


