import AWS from "aws-sdk";

// Initialize API Gateway Management API
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: "https://8ox6366ut3.execute-api.us-east-1.amazonaws.com/production/",
});

// Initialize DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event, context) => {
  console.log("Event:", event);

  const connectionId = event.requestContext.connectionId;

  let message;
  try {
    message = JSON.parse(event.body);
  } catch (error) {
    console.error("Invalid JSON:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const userId = message.message?.userId;  // Extract userId from the nested message object

  if (!userId) {
    console.error("UserId not provided in the message");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "UserId is required in the message" }),
    };
  }

  console.log(`Connection ID: ${connectionId}`);
  console.log("Received Message:", message);

  // Create response payload
  const responseMessage = {
    message: "Connection successful",
    connectionId: connectionId,
    receivedMessage: message,
  };

  // DynamoDB parameters to insert a new connection
  const dynamoParams = {
    TableName: "SocketConnectionTable",
    Item: {
      userId: userId,  // Partition Key
      connectionId: connectionId,  // Sort Key
      timestamp: new Date().toISOString(),  // Timestamp
    },
  };

  try {
    // Insert the connection data into DynamoDB
    await dynamoDb.put(dynamoParams).promise();

    // Send message back to the client
    await apigwManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(responseMessage),
      })
      .promise();

    return { statusCode: 200, body: JSON.stringify({ message: "Message sent back to client" }) };
  } catch (error) {
    console.error("Failed to store connection or send message:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to store connection or send message", error }) };
  }
};