import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'DeviceConsumptionTable';

// Function to query device consumption data from DynamoDB
const queryDeviceConsumptionFromDynamoDB = async (deviceId, sessionId) => {
  try {
    let params = {
      TableName: tableName,
      KeyConditionExpression: 'deviceId = :deviceId', // Query by deviceId
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
      },
    };

    // If sessionId is provided, add it to the query
    if (sessionId) {
      params.KeyConditionExpression += ' AND sessionId = :sessionId';
      params.ExpressionAttributeValues[':sessionId'] = sessionId;
    }

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried device consumption data for deviceId: ${deviceId} with sessionId: ${sessionId}`);
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
    // Extract deviceId and sessionId from query parameters
    const deviceId = event.queryStringParameters && event.queryStringParameters.deviceId;
    const sessionId = event.queryStringParameters && event.queryStringParameters.sessionId;

    if (!deviceId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing required query parameter: deviceId.',
        }),
      };
    }

    // Query DynamoDB for device consumption data with or without sessionId
    const consumptionData = await queryDeviceConsumptionFromDynamoDB(deviceId, sessionId);

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
          message: 'Device consumption data not found for the specified deviceId and/or sessionId.',
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
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
