import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

// Function to update data in DynamoDB
const updateBudgetRecordsDataInDynamoDB = async ( userId, updatedData) => {
  try {
    const params = {
      TableName: tableName,
      Key: {  userId },
      UpdateExpression: `
        SET 
          budgets = :budgets,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':budgets': updatedData.budgets,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW', // Returns the updated item
    };

    console.log("DynamoDB Update Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.update(params).promise();
    console.log(`Updated BudgetRecords data in DynamoDB: ${JSON.stringify(result.Attributes)}`);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating BudgetRecords data in DynamoDB:', error);
    throw new Error('Failed to update BudgetRecords data in DynamoDB.');
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
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const {  userId, budgets,totalCost } = requestBody;

    // Validate input
    if (!userId || typeof(budgets) !== 'object') {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid  userId, or budgets in request body.',
        }),
      };
    }

    // Process budgets data
    const updatedBudgets = budgets;

    console.log("Processed budgets data:", JSON.stringify(updatedBudgets, null, 2));

    const updatedData = {
      budgets: updatedBudgets
    };

    // Update DynamoDB
    const updatedItem = await updateBudgetRecordsDataInDynamoDB( userId, updatedData);



    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'BudgetRecords data successfully updated in DynamoDB.',
        updatedData: updatedItem,
      }),
    };
  } catch (error) {
    console.error('Error updating BudgetRecords data:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
