import { ChangePasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";

async function ChangePasswordApi(refreshToken, accessToken, oldPassword, newPassword) {
    try {
        const response = await changePasswordAction(accessToken, oldPassword, newPassword)
        return response;
    } catch (error) {
        console.error("Error Changing Password:", error);
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");

            // Refresh access token
            const newTokens = await RefreshTokenApi(refreshToken);
            return await changePasswordAction(newTokens.accessToken);
        }
        throw error;
    }
}

const changePasswordAction = async (accessToken, oldPassword, newPassword) => {
    const params = {
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
    };

    const command = new ChangePasswordCommand(params);
    const response = await cognitoProviderClient.send(command);
    console.log("Password changed successfully:", response);
}

export default ChangePasswordApi;
