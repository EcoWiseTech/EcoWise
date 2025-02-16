import { ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";

async function ResetPasswordApi(email, code, newPassword) {
    try {

        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID, 
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        };

        const command = new ConfirmForgotPasswordCommand(params);
        const response = await cognitoProviderClient.send(command);

        return response; // Success response
    } catch (error) {
        throw error; // Forward error for higher-level handling
    }
}

export default ResetPasswordApi;
