import { InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider"; // Import SDK v3 components
import cognitoProviderClient from "./AwsCognitoInit";

async function SignInApi(email, password, mfaCode = null, session = null) {
  try {
    let params;
    let command;
    // initial sign in
    if (!mfaCode) {
      params = {
        AuthFlow: process.env.REACT_APP_COGNITO_AUTH_FLOW,
        ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };

      command = new InitiateAuthCommand(params);

      // Send the sign-in request and wait for the response
      const response = await cognitoProviderClient.send(command);
    }
    // User has input mfa code
    else {
      params = {
        ChallengeName: process.env.REACT_APP_COGNITO_SMS_MFA_CHALLENGE,
        ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        ChallengeResponses: {
          USERNAME: email,
          SMS_MFA_CODE: mfaCode,
        },
        Session: session, // Use the session returned from the initial sign-in
      };
      command = new RespondToAuthChallengeCommand(params);
    }

    const response = await cognitoProviderClient.send(command);

    // Handle MFA challenge
    if (response.ChallengeName === "SMS_MFA") {
      // Return the session and challenge for MFA verification
      return {
        challengeName: response.ChallengeName,
        session: response.Session,
      };
    }

    // Extract tokens from response
    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

    return {
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    };
  } catch (error) {
    throw error; 
  }
}

export default SignInApi;
