import AWS from "aws-sdk";

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// SQS Queue URL (Replace with your actual queue URL)
const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/783764587062/prod-sendRealTimeNotification";

export const lambdaHandler = async (event, context) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  const currentTime = new Date();

  // Scan the Temperature Table
  const tempScanParams = {
    TableName: "prod-TemperatureTableName",
  };

  try {
    const tempData = await dynamoDb.scan(tempScanParams).promise();
    const latestRecords = {};

    // Find the latest record per location
    tempData.Items.forEach((record) => {
      const location = record.Location;
      const recordTime = new Date(record.Timestamp);

      if (!latestRecords[location] || Math.abs(currentTime - recordTime) < Math.abs(currentTime - new Date(latestRecords[location].Timestamp))) {
        latestRecords[location] = record;
      }
    });

    // Calculate average temperature
    const temperatures = Object.values(latestRecords).map(record => record.temperature);
    const avgTemperature = parseFloat(
      (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(2)
    );
    

    console.log(`Average temperature: ${avgTemperature}`);

    if (avgTemperature < 30) {
      console.log("Temperature below 30°C, checking connected clients...");

      // Fetch connected clients from SocketConnectionTable
      const socketParams = {
        TableName: "SocketConnectionTable",
      };
      const socketData = await dynamoDb.scan(socketParams).promise();

      if (socketData.Items.length > 0) {
        for (const connection of socketData.Items) {
          const userId = connection.userId;
          const connectionId = connection.connectionId;
          const messageBody = `The current average temperature is ${avgTemperature}°C. We suggest you turn off your AC devices.`;

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
          console.log(`Sent SQS message to user ${userId}: ${messageBody}`);

          // Wait for 5 seconds before sending the next message
          await sleep(5000);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Temperature check completed successfully." }),
    };
  } catch (error) {
    console.error("Error processing the data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing the data.", error }),
    };
  }
};
