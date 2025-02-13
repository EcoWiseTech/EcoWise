import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const tableName = 'DeviceConsumptionTable';


// Function to update device consumption data in DynamoDB
const updateDeviceConsumptionInDynamoDB = async (deviceId, sessionId, updatedData) => {
  try {
    const params = {
      TableName: tableName,
      Key: { deviceId, sessionId },
      UpdateExpression: `
        SET 
          model = :model,
          consumption = :consumption,
          #type = :type, 
          customModel = :customModel,
          #status = :status,
          startTime = :startTime,
          endTime = :endTime,
          totalConsumption = :totalConsumption
      `,
      ExpressionAttributeNames: {
        "#type": "type",  // Map #type to 'type' in DynamoDB
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ':model': updatedData.model,
        ':consumption': updatedData.consumption,
        ':type': updatedData.type,
        ':customModel': updatedData.customModel || "",
        ':status': updatedData.status,
        ':startTime': updatedData.startTime,
        ':endTime': updatedData.endTime,
        ':totalConsumption': updatedData.totalConsumption,
      },
      ReturnValues: 'ALL_NEW', // Returns the updated item
    };

    console.log("DynamoDB Update Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.update(params).promise();
    console.log(`Updated device consumption data in DynamoDB: ${JSON.stringify(result.Attributes)}`);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating device consumption data in DynamoDB:', error);
    throw new Error('Failed to update device consumption data in DynamoDB.');
  }
};


const publishSNS = async (updatedItem) => {
  //FOR BUDGET CHECK -> Publish SNS Topic
    // console.log(updatedItem["userId"])
    let date = updatedItem["endTime"].slice(0,10)
    console.log(`date: ${date}`)
    console.log(`userId: ${updatedItem["userId"]}`)
    const eventText = {
      userId: updatedItem["userId"],
      date: date
    }
    console.log(`created eventText`)

    var snsParams = {
      Message: JSON.stringify(eventText), 
      Subject: "SNS From UpdateDeviceConsumption Lambda",
      TopicArn: process.env.TopicArn
    }
    console.log(`created snsParams`)

    var snsResult = await sns.publish(snsParams).promise()

    console.log(`snsResult: ${JSON.stringify(snsResult)}`)
    return snsResult
}

// Lambda handler
export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda context:', JSON.stringify(context, null, 2));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.deviceId ? event : JSON.parse(event.body);
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
    const {
      deviceId,
      sessionId,
      model,
      consumption,
      type,
      customModel,
      status,
      startTime,
      endTime,
      totalConsumption,
    } = requestBody;

    // Validate input
    if (!deviceId || !sessionId || !model || !consumption || !type || !status || !startTime || !endTime || !totalConsumption) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid required fields in request body.',
        }),
      };
    }

    const updatedData = {
      model,
      consumption,
      type,
      customModel,
      status,
      startTime,
      endTime,
      totalConsumption,
    };

    // Update DynamoDB
    const updatedItem = await updateDeviceConsumptionInDynamoDB(deviceId, sessionId, updatedData);

    const publishBudgetSNS = await publishSNS(updatedItem);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Device consumption data successfully updated in DynamoDB.',
        updatedData: updatedItem,
      }),
    };
  } catch (error) {
    console.error('Error updating device consumption data:', error);
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
