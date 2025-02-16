import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'HomeTable';

// Function to update data in DynamoDB
const updateHomeDataInDynamoDB = async (uuid, userId, updatedData) => {
  try {
    const params = {
      TableName: tableName,
      Key: { uuid, userId },
      UpdateExpression: `
        SET 
          homeName = :homeName,
          rooms = :rooms,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':homeName': updatedData.homeName,
        ':rooms': updatedData.rooms,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW', // Returns the updated item
    };

    console.log("DynamoDB Update Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.update(params).promise();
    console.log(`Updated home data in DynamoDB: ${JSON.stringify(result.Attributes)}`);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating home data in DynamoDB:', error);
    throw new Error('Failed to update home data in DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda context:', JSON.stringify(context, null, 2));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.uuid ? event : JSON.parse(event.body);
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
    const { uuid, userId, homeName, rooms } = requestBody;

    // Validate input
    if (!uuid || !userId || !homeName || !Array.isArray(rooms)) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid uuid, userId, homeName, or rooms in request body.',
        }),
      };
    }

    // Process room data
    const updatedRooms = rooms
      .filter((room) => room.roomName?.trim()) // Skip rooms with empty names
      .map((room) => ({
        roomId: room.roomId || uuidv4(), // Generate new roomId if missing
        roomName: room.roomName,
        devices: room.devices || [],
      }));

    console.log("Processed rooms data:", JSON.stringify(updatedRooms, null, 2));

    const updatedData = {
      homeName,
      rooms: updatedRooms,
    };

    // Update DynamoDB
    const updatedItem = await updateHomeDataInDynamoDB(uuid, userId, updatedData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Home data successfully updated in DynamoDB.',
        updatedData: updatedItem,
      }),
    };
  } catch (error) {
    console.error('Error updating home data:', error);
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
