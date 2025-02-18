import AWS from 'aws-sdk';


const preferenceTableName = "prod-PreferenceTableName";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES()
const sns = new AWS.SNS();
// --------------------------------------------------------------------------------//
// Email message
// 1a Example SNS Message with an Email Template
// {
//   "isEmail": true,
//   "toEmail": "recipient@example.com",
//   "isTemplate": true,
//   "TemplateName": "BudgetTemplate",
//   "TemplateData": { "budgetLimit": "${Number(dailyBudgetLimit).toFixed(2)}" }
// }
// 1️b Sending Email Only
// {
//   "isEmail": true,
//   "toEmail": "recipient@example.com",
//   "isTemplate": false,
//   "Subject": "Welcome!",
//   "Body": {
//     "Html": "<h1>Hello, welcome to our service!</h1>",
//     "Text": "Hello, welcome to our service!"
//   }
// }

// 2️ Sending SMS Only
// {
//   "isSms": true,
//   "toPhoneNumber": "+1234567890",
//   "smsMessage": "Your OTP is 123456."
// }

// 3️ Sending Both Email & SMS
// {
//   "isEmail": true,
//   "toEmail": "recipient@example.com",
//   "isSms": true,
//   "toPhoneNumber": "+1234567890",
//   "smsMessage": "Your OTP is 123456.",
//   "isTemplate": false,
//   "Subject": "Welcome!",
//   "Body": {
//     "Html": "<h1>Hello, welcome to our service!</h1>",
//     "Text": "Hello, welcome to our service!"
//   }
// }
// --------------------------------------------------------------------------------//
const queryPreferenceDataFromDynamoDB = async (userId,uuid) => {
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

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  try {
    // Parse the SNS message
    // const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const sqsMessage = JSON.parse(event.Records[0].body);

    // Extract parameters
    const { isEmail, isSms, toEmail, toPhoneNumber, userId} = sqsMessage;
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
    const isSmsToggled = PreferenceData[0].budgets.isSmsNotification != null ? PreferenceData[0].budgets.isSmsNotification : null
    const isEmailToggled = PreferenceData[0].budgets.isEmailNotification != null ? PreferenceData[0].budgets.isEmailNotification : null

    if (!isSmsToggled){
      isSms = false
    }
    if (!isEmailToggled){
      isEmail = false
    }

    if (!isEmail && !isSms) throw new Error("Either isEmail or isSms must be true");
    

    // **Send Email** if isEmail is true
    if (isEmail) {
      if (!toEmail) throw new Error("Missing recipient email (toEmail)");

      let emailParams;

      if (sqsMessage.isTemplate) {
        // Send templated email
        emailParams = {
          Destination: { ToAddresses: [toEmail] },
          Source: process.env.SENDER_EMAIL, // Fetch from environment variables
          Template: sqsMessage.TemplateName || "DefaultTemplate",
          TemplateData: sqsMessage.TemplateData ? JSON.stringify(sqsMessage.TemplateData) : "{}"
        };
        console.log("Sending template email:", emailParams);
        await ses.sendTemplatedEmail(emailParams).promise();
      } else {
        // Send raw email
        emailParams = {
          Destination: { ToAddresses: [toEmail] },
          Message: {
            Body: {
              Html: { Charset: "UTF-8", Data: sqsMessage.Body?.Html || "" },
              Text: { Charset: "UTF-8", Data: sqsMessage.Body?.Text || "" }
            },
            Subject: { Charset: "UTF-8", Data: sqsMessage.Subject || "No Subject" }
          },
          Source: process.env.SENDER_EMAIL
        };
        console.log("Sending raw email:", emailParams);
        await ses.sendEmail(emailParams).promise();
      }
    }

    // **Send SMS** if isSms is true
    if (isSms) {
      if (!toPhoneNumber) throw new Error("Missing recipient phone number (toPhoneNumber)");

      const smsParams = {
        Message: sqsMessage.smsMessage || "Default SMS Message",
        TopicArn: "arn:aws:sns:us-east-1:783764587062:prod-NotificationSenderSnsTopic" // process.env.TopicArn // toPhoneNumber
      };
      console.log("Sending SMS:", smsParams);
      await sns.publish(smsParams).promise();
    }

    return {
      statusCode: 200, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }, body: JSON.stringify({ message: "Notification sent successfully" })
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }, body: JSON.stringify({ error: error.message })
    };
  }

};
