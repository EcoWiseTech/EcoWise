import pkg from '@aws-sdk/client-cognito-identity-provider';

const { CognitoIdentityProviderClient, AdminGetUserCommand } = pkg;

// Lambda handler
export const lambdaHandler = async (event, context) => {
  // Extract the email from the event
  console.log("Event received:", JSON.stringify(event));  // Log the event
  const requestBody = event.body ? JSON.parse(event.body) : event;

  const { email } = requestBody;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email is required' }),
    };
  }

  // Get the UserPoolId from environment variables
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'UserPoolId is not configured in environment variables' }),
    };
  }

  // Initialize the CognitoIdentityProviderClient
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION
  });

  try {
    console.log("Checking if user exists with email:", email);
    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,  // Use the environment variable for UserPoolId
      Username: email,  // In Cognito, username is typically the email
    });
    const response = await client.send(command);
    console.log('Cognito user found');

    // Return success response with user details
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User found'
      }),
    };
  } catch (error) {
    // If the error is not user not found, rethrow it
    if (error.name !== 'UserNotFoundException') {
      console.error('Error checking user exists:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error checking user', error: error.message }),
      };
    }
    console.log('User not found in Cognito');

    // Return response indicating user not found
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'User not found' }),
    };
  }
};

