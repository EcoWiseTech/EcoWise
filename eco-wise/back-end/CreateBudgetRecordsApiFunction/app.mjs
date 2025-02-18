import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

// Function to insert data into DynamoDB
const insertBudgetRecordsDataIntoDynamoDB = async (budgetrecordsData) => {
  try {
    const params = {
      TableName: tableName,
      Item: budgetrecordsData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted budgetrecords data into DynamoDB: ${JSON.stringify(budgetrecordsData)}`);
  } catch (error) {
    console.error('Error inserting budgetrecords data into DynamoDB:', error);
    throw new Error('Failed to insert budgetrecords data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.budgets ? event : JSON.parse(event.body);
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
    const { userId, budgets } = requestBody;
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if ( !userId || typeof(budgets) !== 'object' ) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid userId, or budgets in request body.',
        }),
      };
    }

    // Generate UUID for budgetrecords and process rooms
    const budgetData = budgets;

    const budgetrecordsData = {
      userId,
      budgets: budgetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    await insertBudgetRecordsDataIntoDynamoDB(budgetrecordsData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'BudgetRecords data successfully created and stored in DynamoDB.',
        budgetrecordsData,
      }),
    };
  } catch (error) {
    console.error('Error processing budgetrecords data:', error);
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
