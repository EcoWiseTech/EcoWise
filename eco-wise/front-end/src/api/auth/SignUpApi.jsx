import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider"; // Import the required SDK v3 components
import cognitoProviderClient from "./AwsCognitoInit";

async function SignUpUserApi(email, fullName, password) {
  try {
    const params = {
      ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'given_name',
          Value: fullName,
        },
      ],
    };

    // Create the command using the provided parameters
    const command = new SignUpCommand(params);

    // Send the sign-up request and wait for the response
    const data = await cognitoProviderClient.send(command);
    return data; // Return the successful response
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

export default SignUpUserApi;
