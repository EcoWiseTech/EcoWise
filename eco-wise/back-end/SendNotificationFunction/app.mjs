import pkg from '@aws-sdk/client-cognito-identity-provider';
import AWS from 'aws-sdk';


const { CognitoIdentityProviderClient, AdminGetUserCommand } = pkg;
const ses = new AWS.SES()

const publishSES = async(formattedUserObj,dailyBudgetLimit) => {
  const sesParams = {
    Destination: {
      ToAddresses: [
        formattedUserObj["email"],
      ],
    },
    Source: "sgecowisetech@gmail.com",
    Template: "BudgetTemplate",
    TemplateData: `{ "budgetLimit": "${Number(dailyBudgetLimit).toFixed(2)}" }`,
    ReplyToAddresses: ["sgecowisetech@gmail.com"],
    ReturnPath: "sgecowisetech@gmail.com"
  };  
  console.log(`sesParamsHERE: ${JSON.stringify(sesParams)}`);
  const sesResult = await ses.sendTemplatedEmail(sesParams).promise();
  console.log(`sesResult: ${sesResult}`)
  return sesResult
}

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  let userId = null
  let dailyBudgetLimit = null
  try {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message)
    console.log(`snsMessage: ${JSON.stringify(snsMessage)}`)
     //check NotificationSettings
     const isBudgetNotification = snsMessage["preferenceData"]["budgets"]["isBudgetNotification"]
    if (!isBudgetNotification) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'isBudgetNotification is set to false',
        }),
      };
    }
    userId =  snsMessage["userId"];
    dailyBudgetLimit = snsMessage["preferenceData"]["budgets"]["dailyBudgetLimit"];
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing required query parameter: userId.',
        }),
      };
    }
    if (!dailyBudgetLimit) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing required query parameter: dailyBudgetLimit',
        }),
      };
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'UserPoolId is not configured in environment variables' }),
    };
  }

  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION
  });

  try {
    console.log("Checking if user exists with userId:", userId);
    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,   
      Username: userId, 
    });
    const response = await client.send(command);
    const formattedUserObj = formatUserObject(response);
    console.log('Cognito user found:', formattedUserObj);
    //HERERRER

   
    
    const sendEmailNotification = await publishSES(formattedUserObj,dailyBudgetLimit);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'SES sent',
      }),
    };
  } catch (error) {
    if (error.name !== 'UserNotFoundException') {
      console.error('Error checking user exists:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error checking user', error: error.message }),
      };
    }
    console.log('User not found in Cognito');

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'User not found' }),
    };
  }
};

const formatUserObject = (userObject) => {
  if (userObject == null) {
      return null;
  }
  let formatedUserAttributes = {};
  userObject.UserAttributes.forEach(attribute => {
      formatedUserAttributes[attribute.Name] = attribute.Value;
  });
  return formatedUserAttributes;
}
