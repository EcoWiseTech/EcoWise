import pkg from '@aws-sdk/client-cognito-identity-provider';

const { CognitoIdentityProviderClient, ListUsersCommand } = pkg;

// Lambda handler
export const lambdaHandler = async (event, context) => {
  // Extract the sub (userId from IDP) from the event
  console.log("Event received:", JSON.stringify(event));  // Log the event
  const requestBody = event.body ? JSON.parse(event.body) : event;

  const { sub } = requestBody;

  if (!sub) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'sub is required' }),
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
    region: process.env.AWS_REGION,
  });

  try {
    // List users in the User Pool
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
    });
    const response = await client.send(command);
    
    // Search through users to find one with the matching sub in their identities
    const user = response.Users.find((user) => {
      const identities = user.Attributes.find(attr => attr.Name === 'identities');
      if (identities) {
        const identityList = JSON.parse(identities.Value);  // identities are in JSON format
        return identityList.some(identity => identity.userId === sub);  // Check if userId matches sub
      }
      return false;
    });

    if (user) {
      const formattedUserObj = formatUserObject(user);
      console.log('Cognito user found:', formattedUserObj);

      // Return success response with user details
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'User found',
          user: formattedUserObj,  // Return the user details
        }),
      };
    } else {
      console.log('IDP is not linked to any account');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'IDP is not linked to any account' }),
      };
    }
  } catch (error) {
    console.error('Error checking user exists:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking user', error: error.message }),
    };
  }
};

// Helper function to format user attributes
const formatUserObject = (userObject) => {
  if (userObject == null) {
    return null;
  }
  let formattedUserAttributes = {};
  userObject.Attributes.forEach(attribute => {
    formattedUserAttributes[attribute.Name] = attribute.Value;
  });
  return formattedUserAttributes;
};
