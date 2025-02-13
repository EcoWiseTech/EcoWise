import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'PreferenceTable';

// Function to insert data into DynamoDB
const insertPreferenceDataIntoDynamoDB = async (preferenceData) => {
  try {
    const params = {
      TableName: tableName,
      Item: preferenceData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted preference data into DynamoDB: ${JSON.stringify(preferenceData)}`);
  } catch (error) {
    console.error('Error inserting preference data into DynamoDB:', error);
    throw new Error('Failed to insert preference data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.budgets ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { userId, budgets } = requestBody;
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if ( !userId || typeof(budgets) !== 'object' ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing or invalid userId, or budgets in request body.',
        }),
      };
    }

    // Generate UUID for preference and process rooms
    const preferenceUuid = uuidv4();
    const budgetData = budgets;

    const preferenceData = {
      uuid: preferenceUuid,
      userId,
      budgets: budgetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    await insertPreferenceDataIntoDynamoDB(preferenceData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Preference data successfully created and stored in DynamoDB.',
        preferenceData,
      }),
    };
  } catch (error) {
    console.error('Error processing preference data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
