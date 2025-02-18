import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

// Function to delete a BudgetRecords from DynamoDB
const deleteBudgetRecordsFromDynamoDB = async ( userId) => {
  try {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId,
      },
    };

    console.log("DynamoDB Delete Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.delete(params).promise();
    console.log(`Successfully deleted BudgetRecords with  and userId: ${userId}`);
    return result;
  } catch (error) {
    console.error('Error deleting BudgetRecords from DynamoDB:', error);
    throw new Error('Failed to delete BudgetRecords from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda context:', JSON.stringify(context, null, 2));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const {  userId } = requestBody;

    // Validate input
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS,DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid uuid or userId in request body.',
        }),
      };
    }

    // Delete BudgetRecords from DynamoDB
    await deleteBudgetRecordsFromDynamoDB( userId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'BudgetRecords successfully deleted from DynamoDB.',
      }),
    };
  } catch (error) {
    console.error('Error deleting BudgetRecords:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
