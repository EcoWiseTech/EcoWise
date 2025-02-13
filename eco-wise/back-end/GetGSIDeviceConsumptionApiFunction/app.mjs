import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'DeviceConsumptionTable';
const indexName = 'userId-startTime-index';

// Function to query device consumption data from DynamoDB
const queryDeviceConsumptionFromDynamoDB = async (userId,startTime) => {
  try {
    let params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: 'userId = :userId ', // Query by userId
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried device consumption data for userId: ${userId} with startTime: ${startTime}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying device consumption data from DynamoDB:', error);
    throw new Error('Failed to query device consumption data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId and startTime from query parameters
    const userId = event.queryStringParameters && event.queryStringParameters.userId;
    const startTime = event.queryStringParameters && event.queryStringParameters.startTime;
    console.log(`HERE userid: userId`)

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

    // Query DynamoDB for device consumption data with or without startTime
    const consumptionData = await queryDeviceConsumptionFromDynamoDB(userId,null);

    // Ensure that at least one item is returned
    if (consumptionData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Device consumption data not found for the specified userId and/or startTime.',
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
        message: 'Device consumption data successfully retrieved.',
        data: consumptionData, // Return the queried data
      }),
    };
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
};
