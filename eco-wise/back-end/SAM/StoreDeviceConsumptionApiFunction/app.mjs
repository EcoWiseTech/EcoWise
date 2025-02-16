import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'DeviceConsumptionTable';

// Function to insert device consumption data into DynamoDB
const insertDeviceConsumptionIntoDynamoDB = async (consumptionData) => {
  try {
    const params = {
      TableName: tableName,
      Item: consumptionData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted device consumption data into DynamoDB: ${JSON.stringify(consumptionData)}`);
  } catch (error) {
    console.error('Error inserting device consumption data into DynamoDB:', error);
    throw new Error('Failed to insert device consumption data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.deviceId ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { model, consumption, type, customModel, deviceId, status, uuid, userId } = requestBody;

    // Validate input
    if (!model || !consumption || !type || !deviceId || !status) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid model, consumption, type, deviceId, or status in request body.',
        }),
      };
    }

    // Generate sessionId and timestamps
    const sessionId = uuidv4();
    const startTime = new Date().toISOString();

    const consumptionData = {
      deviceId, // Partition key
      sessionId, // Sort key
      userId,
      uuid,
      model,
      consumption,
      type,
      customModel: customModel || "", // Optional field
      status,
      startTime,
      endTime: "", // Will be updated when the session ends
    };

    // Insert into DynamoDB
    await insertDeviceConsumptionIntoDynamoDB(consumptionData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Device consumption data successfully stored in DynamoDB.',
        consumptionData,
      }),
    };
  } catch (error) {
    console.error('Error processing device consumption data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
