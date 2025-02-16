import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'PreferenceTable';

// Function to delete a Preference from DynamoDB
const deletePreferenceFromDynamoDB = async (uuid, userId) => {
  try {
    const params = {
      TableName: tableName,
      Key: {
        uuid: uuid,
        userId: userId,
      },
    };

    console.log("DynamoDB Delete Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.delete(params).promise();
    console.log(`Successfully deleted Preference with uuid: ${uuid} and userId: ${userId}`);
    return result;
  } catch (error) {
    console.error('Error deleting Preference from DynamoDB:', error);
    throw new Error('Failed to delete Preference from DynamoDB.');
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
    const { uuid, userId } = requestBody;

    // Validate input
    if (!uuid || !userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid uuid or userId in request body.',
        }),
      };
    }

    // Delete Preference from DynamoDB
    await deletePreferenceFromDynamoDB(uuid, userId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Preference successfully deleted from DynamoDB.',
      }),
    };
  } catch (error) {
    console.error('Error deleting Preference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
