import AWS from "aws-sdk";

// Initialize the API Gateway Management API client
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: "https://8ox6366ut3.execute-api.us-east-1.amazonaws.com/production/",
});

// Initialize the DynamoDB Document Client to fetch connection info
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Lambda handler triggered by the SQS message
export const lambdaHandler = async (event, context) => {
  console.log("Received SQS event:", JSON.stringify(event, null, 2));

  // Loop through all the messages in the SQS event
  for (const record of event.Records) {
    // Extract the userId and connectionId from the message attributes
    const userId = record.messageAttributes.userId.stringValue;
    const connectionId = record.messageAttributes.connectionId.stringValue;
    const message = record.body;  // The body contains the actual message to send

    console.log(`Sending message to userId: ${userId}, connectionId: ${connectionId}`);

    try {
      // Get connection details from DynamoDB
      const connectionParams = {
        TableName: "SocketConnectionTable",
        Key: {
          userId: userId, // Partition key
          connectionId: connectionId, // Sort key
        },
      };
      
      const connectionData = await dynamoDb.get(connectionParams).promise();

      if (!connectionData.Item) {
        console.log(`No connection found for userId: ${userId}, connectionId: ${connectionId}`);
        continue;  // Skip if no matching connection is found
      }

      // Create the message to be sent
      const responseMessage = {
        message: message,  // The message content from the SQS
        userId: userId,
        connectionId: connectionId,
      };

      // Send the message to the WebSocket client
      await apigwManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(responseMessage),
        })
        .promise();

      console.log(`Message sent to userId: ${userId}, connectionId: ${connectionId}`);
    } catch (error) {
      console.error(`Error sending message to userId: ${userId}, connectionId: ${connectionId}`, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Messages processed successfully" }),
  };
};
