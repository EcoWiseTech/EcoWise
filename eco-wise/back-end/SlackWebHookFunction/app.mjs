// If your Lambda environment is set to Node.js 22.x and using ES modules:
import AWS from 'aws-sdk';  // AWS SDK v2
import https from 'https';

// If you're using CommonJS modules instead, use:
// const AWS = require('aws-sdk');
// const https = require('https');

export const lambdaHandler = async (event) => {
  console.log("event")
  console.log(event)
  // The Slack webhook URL (replace with your actual Slack webhook)
  const url = process.env.SlackWebHookURL;
  
  // Extract the message from the SNS event
  const snsMessage = event?.Records?.[0]?.Sns?.Message || "No message found";

  // Prepare Slack message payload
  const slackMessage = {
    channel: "#infrastructure",
    username: "EcoWise-Bot",
    text: snsMessage,
    icon_emoji: ":ghost:"
  };

  // Convert payload to a JSON string
  const body = JSON.stringify(slackMessage);

  // Return a Promise so the Lambda can await the HTTPS response
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method: 'POST' },
      (res) => {
        let responseData = '';

        // Collect response data
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        // Once the response is complete
        res.on('end', () => {
          console.log({
            message: snsMessage,
            status_code: res.statusCode,
            response: responseData
          });

          // Resolve the promise with the final response
          resolve({
            statusCode: res.statusCode,
            body: responseData
          });
        });
      }
    );

    // Handle request errors
    req.on('error', (error) => {
      console.error("Error posting to Slack:", error);
      reject(error);
    });

    // Write the Slack message body and end the request
    req.write(body);
    req.end();
  });
};