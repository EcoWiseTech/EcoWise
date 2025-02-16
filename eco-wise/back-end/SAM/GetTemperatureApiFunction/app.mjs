import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'TemperatureTable';

// Main handler function
export const lambdaHandler = async (event, context) => {
  try {
    const { startDate, endDate, location } = event.queryStringParameters || {};

    if (!startDate || !endDate || !location) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters: startDate, endDate, and location are required.',
        }),
      };
    }

    // Set up the scan parameters
    const params = {
      TableName: tableName,
      FilterExpression: '#ts BETWEEN :startDate AND :endDate AND #loc = :location',
      ExpressionAttributeNames: {
        '#ts': 'Timestamp', // Alias for reserved keyword
        '#loc': 'Location', // Alias for reserved keyword
      },
      ExpressionAttributeValues: {
        ':startDate': startDate,
        ':endDate': endDate,
        ':location': location,
      },
    };

    // Perform the scan operation
    const data = await dynamoDB.scan(params).promise();

    console.log('Read data from DynamoDB:', data.Items);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        data: data.Items,
      }),
    };
  } catch (error) {
    console.error('Error reading data from DynamoDB:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while reading data from DynamoDB.',
        error: error.message,
      }),
    };
  }
};
