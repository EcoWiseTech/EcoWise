import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

// Function to query data from DynamoDB, now with conditional query based on uuid
const queryBudgetRecordsDataFromDynamoDB = async (userId ) => {
  try {
    let params = {
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId', // Query only by userId initially
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    // If uuid is provided, update the query to include it as the sort key
  

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried BudgetRecords data for userId: ${userId} with`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying BudgetRecords data from DynamoDB:', error);
    throw new Error('Failed to query BudgetRecords data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId and uuid from query parameters
    const userId = event.queryStringParameters && event.queryStringParameters.userId;

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

    // Query DynamoDB for BudgetRecords data with or without uuid based on its presence
    const BudgetRecordsData = await queryBudgetRecordsDataFromDynamoDB(userId);

    // Ensure that at least one item is returned
    if (BudgetRecordsData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'BudgetRecords data not found for the specified userId and/or uuid.',
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
        message: 'BudgetRecords data successfully retrieved.',
        data: BudgetRecordsData, // Return the queried data (whether 1 or more items)
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
