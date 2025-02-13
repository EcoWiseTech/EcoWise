import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'PreferenceTable';

// Function to query data from DynamoDB, now with conditional query based on uuid
const queryPreferenceDataFromDynamoDB = async (userId, uuid) => {
  try {
    let params = {
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId', // Query only by userId initially
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    // If uuid is provided, update the query to include it as the sort key
    if (uuid) {
      params.KeyConditionExpression += ' AND #uuid = :uuid';
      params.ExpressionAttributeNames = {
        '#uuid': 'uuid', // Map uuid to #uuid if it's used
      };
      params.ExpressionAttributeValues[':uuid'] = uuid;
    }

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried Preference data for userId: ${userId} with uuid: ${uuid}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying Preference data from DynamoDB:', error);
    throw new Error('Failed to query Preference data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId and uuid from query parameters
    const userId = event.queryStringParameters && event.queryStringParameters.userId;
    const uuid = event.queryStringParameters && event.queryStringParameters.uuid;

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

    // Query DynamoDB for Preference data with or without uuid based on its presence
    const PreferenceData = await queryPreferenceDataFromDynamoDB(userId, uuid);

    // Ensure that at least one item is returned
    if (PreferenceData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Preference data not found for the specified userId and/or uuid.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Preference data successfully retrieved.',
        data: PreferenceData, // Return the queried data (whether 1 or more items)
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
