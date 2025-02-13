import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'PreferenceTable';

// Function to update data in DynamoDB
const updatePreferenceDataInDynamoDB = async (uuid, userId, updatedData) => {
  try {
    const params = {
      TableName: tableName,
      Key: { uuid, userId },
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
    console.log(`Updated Preference data in DynamoDB: ${JSON.stringify(result.Attributes)}`);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating Preference data in DynamoDB:', error);
    throw new Error('Failed to update Preference data in DynamoDB.');
  }
};

const snsPublish = async (PreferenceData,dailyBudgetLimit,totalCost,totalConsumption,userId) => {
  console.log(`dailyBudgetLimit FROM PREFERENCE: ${dailyBudgetLimit}`);
  if (totalCost >= dailyBudgetLimit   ){ //if total cost overrun budget / reach budget
    //push SNS to trigger notification
    //send over:
    //preferenceInfo + totalCost + dailyBudgetLimit
    let eventText = {
      preferenceData: PreferenceData[0],
      dailyBudgetLimit: dailyBudgetLimit,
      totalCost: totalCost,
      totalConsumption: totalConsumption,
      userId: userId
    }
    //s
    //FOR NOTIFI -> Publish SNS Topic
    
    var snsParams = {
      Message: JSON.stringify(eventText), 
      Subject: "SNS From UpdateDeviceConsumption Lambda",
      TopicArn: process.env.TopicArn
    }
    const snsResult = await sns.publish(snsParams).promise();
    
    console.log(`snsResult: ${JSON.stringify(snsResult)}`)
    return snsResult;
  }
}

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
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { uuid, userId, budgets,totalCost } = requestBody;

    // Validate input
    if (!uuid || !userId || typeof(budgets) !== 'object') {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid uuid, userId, or budgets in request body.',
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
    const updatedItem = await updatePreferenceDataInDynamoDB(uuid, userId, updatedData);


    const snsNotificationPublish = await snsPublish([updatedItem],updatedItem["budgets"]["dailyBudgetLimit"],totalCost,null,userId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Preference data successfully updated in DynamoDB.',
        updatedData: updatedItem,
      }),
    };
  } catch (error) {
    console.error('Error updating Preference data:', error);
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
