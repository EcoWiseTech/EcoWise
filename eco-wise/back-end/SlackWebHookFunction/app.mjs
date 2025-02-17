// If your Lambda environment is set to Node.js 22.x and using ES modules:
import AWS from 'aws-sdk';  // AWS SDK v2
import https from 'https';

// If you're using CommonJS modules instead, use:
// const AWS = require('aws-sdk');
// const https = require('https');
// Function to format the 'expires' field
function formatExpires(expires) {
  const date = new Date(expires);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA' outputs date as YYYY-MM-DD
  return `${time}\n${formattedDate}`;
}

export const lambdaHandler = async (event) => {
  // The Slack webhook URL (replace with your actual Slack webhook)
  const url = process.env.SlackWebHookURL;
  
  // Extract the message from the SNS event
  const snsMessage = event?.Records?.[0]?.Sns?.Message || "No message found";
// Sample input JSON string
const input = '{"region":"us-east-1","consoleLink":"https://console.aws.amazon.com/codesuite/codepipeline/pipelines/sam-pipeline-stack-Pipeline-wFU0XalWWk3P/view?region=us-east-1","approval":{"pipelineName":"sam-pipeline-stack-Pipeline-wFU0XalWWk3P","stageName":"Prod","actionName":"DeployProdApproval","token":"deb2ba83-bf69-449a-bfa4-274c73d23d3c","expires":"2025-02-24T09:43Z","externalEntityLink":null,"approvalReviewLink":"https://console.aws.amazon.com/codesuite/codepipeline/pipelines/sam-pipeline-stack-Pipeline-wFU0XalWWk3P/view?region=us-east-1#/Prod/DeployProdApproval/approve/deb2ba83-bf69-449a-bfa4-274c73d23d3c","customData":"test"}}';

// Parse the input JSON string
const data = JSON.parse(input);

// Construct the Slack message
const slackMessage = {
  channel: "C123ABC456", // Replace with your Slack channel ID
  text: `Deployment Approval Request for ${data.approval.pipelineName}`,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Deployment Approval Request",
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Pipeline:*\n${data.approval.pipelineName}`
        },
        {
          type: "mrkdwn",
          text: `*Stage:*\n${data.approval.stageName}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Expires:*\n${data.approval.expires}`
        },
        {
          type: "mrkdwn",
          text: `*Region:*\n${data.region}`
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Approve"
          },
          style: "primary",
          value: data.approval.token,
          url: data.approval.approvalReviewLink
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "View Change Set"
          },
          value: "reject_deploy",
          url: data.consoleLink
        }
      ]
    }
  ]
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