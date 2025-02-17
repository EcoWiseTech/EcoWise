import AWS from "aws-sdk";

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// SQS Queue URL (Replace with your actual queue URL)
const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/783764587062/prod-sendRealTimeNotification";

export const lambdaHandler = async (event, context) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Get current time
  const currentTime = new Date();

  // Scan the DeviceConsumptionTable for running devices
  const scanParams = {
    TableName: "prod-DeviceConsumptionTable",
    FilterExpression: "#statusAttr = :status",
    ExpressionAttributeNames: {
      "#statusAttr": "status", // Alias for reserved keyword "status"
    },
    ExpressionAttributeValues: {
      ":status": "running",
    },
  };

  try {
    const data = await dynamoDb.scan(scanParams).promise();
    const devicesOverFiveMinutes = [];

    // Loop through the items and filter those running for more than 5 minutes
    for (const item of data.Items) {
      const startTime = new Date(item.startTime);
      const runningTime = (currentTime - startTime) / 1000 / 60; // Convert to minutes

      if (runningTime > 5) {
        devicesOverFiveMinutes.push(item);
      }
    }

    console.log(`Devices running for more than 5 minutes: ${devicesOverFiveMinutes.length}`);

    // Process each device that has been running for more than 5 minutes
    for (const device of devicesOverFiveMinutes) {
      const userId = device.userId;

      // Construct the message to be stored in the prod-Messages table
      const messageBody = `Device ${device.model} has been running for more than 5 minutes.`;

      // Append message to the user's messages list in the prod-Messages table
      const updateParams = {
        TableName: "prod-Message",
        Key: {
          userId: userId,  // Partition key
        },
        UpdateExpression: "SET #messages = list_append(if_not_exists(#messages, :emptyList), :message)",
        ExpressionAttributeNames: {
          "#messages": "messages",
        },
        ExpressionAttributeValues: {
          ":emptyList": [],
          ":message": [messageBody],  // Wrap the message in an array
        },
        ReturnValues: "UPDATED_NEW",  // Return the updated values
      };

      try {
        // Update or create the 'messages' list in the prod-Messages table
        await dynamoDb.update(updateParams).promise();
        console.log(`Appended message for user ${userId} in prod-Messages table`);
      } catch (err) {
        console.error(`Error appending message for user ${userId}:`, err);
      }

      // Now, check for the user's socket connection (this happens after the DB update)
      const socketParams = {
        TableName: "SocketConnectionTable",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };

      const socketData = await dynamoDb.query(socketParams).promise();

      if (socketData.Items.length > 0) {
        // Get connectionId
        const connectionId = socketData.Items[0].connectionId;

        // Construct SQS message
        const sqsParams = {
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: messageBody,
          MessageAttributes: {
            "userId": {
              DataType: "String",
              StringValue: userId,
            },
            "connectionId": {
              DataType: "String",
              StringValue: connectionId,
            },
          },
        };

        // Send message to SQS
        await sqs.sendMessage(sqsParams).promise();
        console.log(`Sent SQS message for user ${userId}: ${messageBody}`);

        // Wait for 5 seconds before sending the next message
        await sleep(5000);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Processing completed successfully." }),
    };
  } catch (error) {
    console.error("Error processing the data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing the data.", error }),
    };
  }
};
