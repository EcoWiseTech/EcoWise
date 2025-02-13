// Main handler function
export const lambdaHandler = async (event, context) => {
  console.log("Trigger event:", JSON.stringify(event, null, 2));

  // Customize only for password reset flow
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    const email = event.request.userAttributes.email || "sampleeamil@gmail.com"
    const userName = event.request.userAttributes.given_name || "User";
    const resetCode = event.request.codeParameter;

    // Customize the email subject
    event.response.emailSubject = "🔐 Reset Your Password - SGEcoWise";

    // Customize the email body with inline CSS for a blue theme
    event.response.emailMessage = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f8fb;
                        color: #333;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background-color: #D6FFFF;
                    }
                    .email-header {
                        text-align: center;
                        background-color: #0073e6 !important;
                        color: #ffffff;
                        padding: 15px;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .email-content {
                        padding: 20px;
                    }
                    .email-footer {
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                        margin-top: 20px;
                    }
                    .reset-button {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #0073e6;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 10px 0;
                    }
                    .reset-button:hover {
                        background-color: #005bb5;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>EcoWise Password Reset</h1>
                    </div>
                    <div class="email-content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>We received a request to reset your password. Please use the code below to reset your password:</p>
                        <h2 style="text-align: center; color: #0073e6;">${resetCode}</h2>
                        <p>You can also reset your password by clicking the button below:</p>
                        <div style="text-align: center;">
                            <a class="reset-button" href="http://localhost:3000/password-reset/${email}/${resetCode}" target="_blank">Reset Password</a>
                        </div>
                        <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                    <div class="email-footer">
                        <p>&copy; ${new Date().getFullYear()} EcoWise. All rights reserved.</p>
                        <p>Need help? <a href="https://localhost:3000" style="color: #0073e6;">Contact Support</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  // Ensure to return the event object for Cognito to proceed
  return event;
};
