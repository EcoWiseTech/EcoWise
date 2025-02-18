import AWS from "aws-sdk";

// Initialize the DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Get the userId from the query parameters or body
  const userId = event.queryStringParameters?.userId || event.body?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId is required." }),
    };
  }

  const params = {
    TableName: "prod-Message",
    Key: {
      userId: userId,  // Partition key
    },
  };

  try {
    // Get the user's messages from the table
    const data = await dynamoDb.get(params).promise();

    if (!data.Item || !data.Item.messages) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No messages found for userId: ${userId}` }),
      };
    }

    // Return the messages in the response
    return {
      statusCode: 200,
      body: JSON.stringify({ messages: data.Item.messages }),
    };
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error retrieving messages.", error }),
    };
  }
};
