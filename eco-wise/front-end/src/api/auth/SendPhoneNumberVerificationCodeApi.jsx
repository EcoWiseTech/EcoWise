import { GetUserAttributeVerificationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";
import { useUserContext } from "../../contexts/UserContext";

async function SendPhoneNumberVerificationCodeApi(accessToken) {
    try {
        const response = await sendCodeAction(accessToken);
        return response
    } catch (error) {
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");
      
            // Refresh access token
            const newTokens = await RefreshTokenApi(accessToken);
            return await sendCodeAction(newTokens.accessToken)
          }
      
          console.error("Error sending phone verification code:", error);
          throw error;
    }
}

const sendCodeAction = async (accessToken) => {
    const params = {
        AccessToken: accessToken,
        AttributeName: "phone_number", 
    };

    const command = new GetUserAttributeVerificationCodeCommand(params);
    const response = await cognitoProviderClient.send(command);

    console.log("Verification code sent successfully:", response);
    return response;
}

export default SendPhoneNumberVerificationCodeApi;
