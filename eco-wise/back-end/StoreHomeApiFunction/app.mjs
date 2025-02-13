import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'HomeTable';

// Function to insert data into DynamoDB
const insertHomeDataIntoDynamoDB = async (homeData) => {
  try {
    const params = {
      TableName: tableName,
      Item: homeData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted home data into DynamoDB: ${JSON.stringify(homeData)}`);
  } catch (error) {
    console.error('Error inserting home data into DynamoDB:', error);
    throw new Error('Failed to insert home data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.homeName ? event : JSON.parse(event.body);
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
    const { homeName, userId, rooms } = requestBody;

    // Validate input
    if (!homeName || !userId || !Array.isArray(rooms)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing or invalid homeName, userId, or rooms in request body.',
        }),
      };
    }

    // Generate UUID for home and process rooms
    const homeUuid = uuidv4();
    const roomData = rooms
      .filter((room) => room.name?.trim()) // Skip empty rooms
      .map((room) => ({
        roomId: uuidv4(),
        roomName: room.name,
        devices: (room.devices || []).map((device) => ({
          ...device,
          status: "stopped",
          startTime:"",
          sessionId:"",
          deviceId: uuidv4(), // Assign a unique deviceId to each device
        })),
      }));

    const homeData = {
      uuid: homeUuid,
      userId,
      homeName,
      rooms: roomData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    await insertHomeDataIntoDynamoDB(homeData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Home data successfully created and stored in DynamoDB.',
        homeData,
      }),
    };
  } catch (error) {
    console.error('Error processing home data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
