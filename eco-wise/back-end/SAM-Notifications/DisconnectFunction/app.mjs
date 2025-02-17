import AWS from "aws-sdk";

// Initialize DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event, context) => {
  console.log("Event:", event);

  const connectionId = event.requestContext.connectionId;  // Get the connectionId from the event

  // Parameters for scanning the DynamoDB table
  const scanParams = {
    TableName: "SocketConnectionTable",
    FilterExpression: "connectionId = :connectionId",  // Filter items based on connectionId
    ExpressionAttributeValues: {
      ":connectionId": connectionId,  // Provide the connectionId value to filter by
    },
  };

  try {
    // Scan the table to find the item with matching connectionId
    const scanResult = await dynamoDb.scan(scanParams).promise();

    if (scanResult.Items.length === 0) {
      console.log("No matching connectionId found.");
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No matching connection found" }),
      };
    }

    // Loop through all the items found in the scan (in case there are multiple)
    for (const item of scanResult.Items) {
      const deleteParams = {
        TableName: "SocketConnectionTable",
        Key: {
          userId: item.userId,  // Partition key
          connectionId: item.connectionId,  // Sort key
        },
      };

      // Delete the item
      await dynamoDb.delete(deleteParams).promise();
      console.log(`Deleted item with connectionId: ${item.connectionId}`);
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Disconnected and item(s) deleted successfully!" }),
    };

    return response;
  } catch (error) {
    console.error("Error deleting item(s):", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete item(s)", error }),
    };
  }
};
