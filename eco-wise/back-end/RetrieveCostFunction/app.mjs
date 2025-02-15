import AWS from 'aws-sdk';
import pkg from '@aws-sdk/client-cognito-identity-provider';

const { CognitoIdentityProviderClient, AdminGetUserCommand } = pkg;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();
const tableName = process.env.tableName;
const indexName = 'userId-startTime-index';
const preferenceTableName = process.env.preferenceTableName;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});



// Function to query device consumption data from DynamoDB
const queryDeviceConsumptionFromDynamoDB = async (userId, date) => {
  try {
    let params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: 'userId = :userId ', // Query by userId
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };
    // If startTime is provided, add it to the query
    if (date) {
      if ('FilterExpression' in params) {
        params.FilterExpression += 'contains (endTime, :date)';
      } else {
        params.FilterExpression = 'contains (endTime, :date)';
      }

      params.ExpressionAttributeValues[':date'] = date;
    }

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried device consumption data for userId: ${userId} with date: ${date}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying device consumption data from DynamoDB:', error);
    throw new Error('Failed to query device consumption data from DynamoDB.');
  }
};


const sqsPublish = async (message, totalCost, dailyBudgetLimit) => {
  if (totalCost >= dailyBudgetLimit) { //if total cost overrun budget / reach budget

    let eventText = message
    
    var params = {
      MessageBody: JSON.stringify(eventText), /* required */
      QueueUrl: process.env.SQS_QUEUE_URL // 'https://sqs.us-east-1.amazonaws.com/783764587062/trigger-Notifier-manual' , //process.env.SQS_QUEUE_URL /* required */
    };
    const sqsResult = await sqs.sendMessage(params).promise();




    // var snsParams = {
    //   Message: JSON.stringify(eventText),
    //   Subject: "SNS From UpdateDeviceConsumption Lambda",
    //   TopicArn: process.env.TopicArn
    // }
    // const snsResult = await sns.publish(snsParams).promise();

    // console.log(`snsResult: ${JSON.stringify(snsResult)}`)
    return sqsResult;
  }
}





const queryPreferenceDataFromDynamoDB = async (userId, uuid) => {
  try {
    let params = {
      TableName: preferenceTableName,
      KeyConditionExpression: 'userId = :userId', // Query only by userId initially
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    // If uuid is provided, update the query to include it as the sort key
    if (uuid) {
      params.KeyConditionExpression += ' AND #uuid = :uuid';
      params.ExpressionAttributeNames = {
        '#uuid': 'uuid', // Map uuid to #uuid if it's used
      };
      params.ExpressionAttributeValues[':uuid'] = uuid;
    }

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried Preference data for userId: ${userId} with uuid: ${uuid}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying Preference data from DynamoDB:', error);
    throw new Error('Failed to query Preference data from DynamoDB.');
  }
};

const parseDynamoDBRecord = (record) => {
  // Extract the "NewImage" from the record
  const newImage = record.NewImage;

  if (!newImage) return null; // Handle cases where NewImage might be missing

  // Function to extract values from DynamoDB's format
  const extractValue = (obj) => obj?.S || obj?.N || obj?.BOOL || obj?.NULL || "";
  console.log("return value")
  console.log(Object.fromEntries(
    Object.entries(newImage).map(([key, value]) => [key, extractValue(value)])
  ))
  // Convert DynamoDB format to a regular JSON object
  return Object.fromEntries(
    Object.entries(newImage).map(([key, value]) => [key, extractValue(value)])
  );
};

const formatUserObject = (userObject) => {
  if (userObject == null) {
      return null;
  }
  let formatedUserAttributes = {};
  userObject.UserAttributes.forEach(attribute => {
      formatedUserAttributes[attribute.Name] = attribute.Value;
  });
  return formatedUserAttributes;
}

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  let ddbInfo = event.Records[0].dynamodb
  let itemInfo = parseDynamoDBRecord(ddbInfo)
  console.log("itemInfo")
  console.log(itemInfo)
  let date = null
  let userId = itemInfo["userId"]
  console.log("userId")
  console.log(userId)
  if (!itemInfo) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: 'Missing required Item info',
      }),
    };
  }
  try {


    // Query DynamoDB for device consumption data with or without date
    const consumptionData = await queryDeviceConsumptionFromDynamoDB(userId, date);

    // Ensure that at least one item is returned
    if (consumptionData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: JSON.stringify({
          message: 'Device consumption data not found for the specified userId and/or date.',
        }),
      };
    }

    // continue
    let totalConsumption = 0
    // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
    const costPerKwh = 0.365 //in $/kWh
    let totalCost = null
    try {
      for (let i = 0; i < consumptionData.length; i++) {
        let deviceRecord = consumptionData[i]
        let consumption = Number(deviceRecord["consumption"])
        let date = deviceRecord["endTime"].slice(0, 10)
        console.log(`date: ${date}`)

        totalConsumption += consumption
        console.log(`consumptionData: ${JSON.stringify(totalConsumption)}`)
      }

    } catch (err) {
      console.log(`err:${err.status}`)
      console.log(`totalConsumption:${totalConsumption}`)
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: JSON.stringify({
          message: err,
        }),
      };
    }
    if (totalConsumption != 0) {
      //calc total cost
      totalCost = totalConsumption * costPerKwh
    }
    // validate if overrun
    //retrieve preference data
    const PreferenceData = await queryPreferenceDataFromDynamoDB(userId, null);
    if (PreferenceData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: JSON.stringify({
          message: 'Preference data not found for the specified userId ',
        }),
      };
    }
    const dailyBudgetLimit = PreferenceData[0].budgets.dailyBudgetLimit

    const userPoolId = process.env.USER_POOL_ID;
    if (!userPoolId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'UserPoolId is not configured in environment variables' }),
      };
    }


    console.log("Checking if user exists with userId:", userId);
    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: userId,
    });
    const cognitoResponse = await cognitoClient.send(command);
    const formattedUserObj = formatUserObject(cognitoResponse);
    console.log('Cognito user found:' );
    console.log(formattedUserObj)
    //HERERRER

    const message = {
      isEmail: true, // Assuming we want to send an email
      toEmail: formattedUserObj["email"], // The email recipient
      isSms: false, // Also sending an SMS
      toPhoneNumber: "+1234567890", // The phone number
      smsMessage: `Your OTP is 123456.`, // The SMS message
      isTemplate: true, // We're using a template for the email
      TemplateName: "BudgetTemplate", // Example template name
      TemplateData: {
        budgetLimit: `${Number(dailyBudgetLimit).toFixed(2)}`, // Budget limit to send in template
      },
    };

    const sqsNotificationPublish = await sqsPublish(message, totalCost, dailyBudgetLimit);
    

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: 'cost data has been succesfully retrieved',
        data: totalConsumption, // Return the queried data
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
