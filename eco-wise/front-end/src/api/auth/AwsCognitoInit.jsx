import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import AWS from 'aws-sdk'

// Initialize the Cognito client
const cognitoProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_ADMIN_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_ADMIN_SECRET_KEY_ID
  }),
});

export const cognitoIdentityClient = new CognitoIdentityClient({
  region: process.env.REACT_APP_AWS_REGION
});

export default cognitoProviderClient;
