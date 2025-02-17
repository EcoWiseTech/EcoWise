import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"; // ES Modules import
import AWS from 'aws-sdk';

const client = new SNSClient({});


const ses = new AWS.SES()
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


export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  try {
    // Parse the SNS message
    // const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const sqsMessage = JSON.parse(event.Records[0].body);

    // Extract parameters
    const { isEmail, isSms, toEmail, toPhoneNumber } = sqsMessage;

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
        PhoneNumber: toPhoneNumber
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
