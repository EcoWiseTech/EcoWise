import { DeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";
import RefreshTokenApi from "./RefreshTokenApi";


// Function to delete the user
async function DeleteUserApi(refreshToken, accessToken) {
    try {
        const response = await DeleteUserAction(accessToken)
        return response;
    } catch (error) {
        console.error("Error Deleting user:", error);
        if (error.name === "NotAuthorizedException" && error.message.includes("expired")) {
            console.warn("Access token expired. Attempting to refresh...");

            // Refresh access token
            const newTokens = await RefreshTokenApi(refreshToken);
            return await DeleteUserAction(newTokens.accessToken);
        }
        throw error;
    }
}


const DeleteUserAction = async (accessToken) => {
    const command = new DeleteUserCommand({
        AccessToken: accessToken,
    });
    await cognitoProviderClient.send(command);
    console.log("User account successfully deleted.");
}

export default DeleteUserApi