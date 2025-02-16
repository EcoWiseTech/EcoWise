import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoProviderClient from "./AwsCognitoInit";

async function RefreshTokenApi(refreshToken) {
  try {
    const params = {
      AuthFlow: process.env.REACT_APP_COGNITO_REFRESH_TOKEN_FLOW,
      ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoProviderClient.send(command);
    const { IdToken, AccessToken } = response.AuthenticationResult;
    return {
      idToken: IdToken,
      accessToken: AccessToken,
    };
  } catch (error) {
    throw error;
  }
}

export default RefreshTokenApi;
