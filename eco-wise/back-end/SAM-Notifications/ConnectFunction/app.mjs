export const lambdaHandler = async (event, context) => {
  console.log("Event:", event)

  const response = {
    statusCode: 200,
    body: JSON.stringify('Connection from Lambda!'),
  };
  return response;
};
