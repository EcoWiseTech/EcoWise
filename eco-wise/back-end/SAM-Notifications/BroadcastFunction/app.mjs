import AWS from "aws-sdk";

// Initialize API Gateway Management API client
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: "https://8ox6366ut3.execute-api.us-east-1.amazonaws.com/production/",
});

// Initialize the DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Initialize the SQS client
const sqs = new AWS.SQS();

// Helper function to sleep for a given duration in milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const lambdaHandler = async (event, context) => {
  console.log("Received SQS event:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const userId = record.messageAttributes.userId.stringValue;
    const connectionId = record.messageAttributes.connectionId.stringValue;
    const message = record.body;
    const receiptHandle = record.receiptHandle; // Needed for deletion

    console.log(`Sending message to userId: ${userId}, connectionId: ${connectionId}`);

    try {
      // Get connection details from DynamoDB
      const connectionParams = {
        TableName: "SocketConnectionTable",
        Key: {
          userId: userId,
          connectionId: connectionId,
        },
      };

      const connectionData = await dynamoDb.get(connectionParams).promise();

      if (!connectionData.Item) {
        console.log(`No connection found for userId: ${userId}, connectionId: ${connectionId}`);
        continue;  
      }

      // Create the message to be sent
      const responseMessage = {
        message: message,
        userId: userId,
        connectionId: connectionId,
      };

      // Send the message to WebSocket
      await apigwManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(responseMessage),
        })
        .promise();

      console.log(`Message sent to userId: ${userId}, connectionId: ${connectionId}`);

      // Wait for 5 seconds before sending the next message
      await sleep(5000);

      // Delete the message from SQS after successful processing
      const deleteParams = {
        QueueUrl: process.env.SQS_QUEUE_URL, // Ensure the SQS URL is set in environment variables
        ReceiptHandle: receiptHandle,
      };

      await sqs.deleteMessage(deleteParams).promise();
      console.log(`Deleted message from SQS: ${receiptHandle}`);
      
    } catch (error) {
      console.error(`Error sending message to userId: ${userId}, connectionId: ${connectionId}`, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Messages processed successfully" }),
  };
};
