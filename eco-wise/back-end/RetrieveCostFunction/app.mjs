import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const tableName = 'DeviceConsumptionTable';
const indexName = 'userId-startTime-index';
const preferenceTableName = 'PreferenceTable';



// Function to query device consumption data from DynamoDB
const queryDeviceConsumptionFromDynamoDB = async (userId,date) => {
  try {
    let params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: 'userId = :userId ', // Query by userId
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };
    // If startTime is provided, add it to the query
    if (date) {
      if ('FilterExpression' in params){
        params.FilterExpression += 'contains (endTime, :date)';
      }else{
        params.FilterExpression = 'contains (endTime, :date)';
      }

      params.ExpressionAttributeValues[':date'] = date;
    }
    
    const result = await dynamoDB.query(params).promise();
    console.log(`Queried device consumption data for userId: ${userId} with date: ${date}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying device consumption data from DynamoDB:', error);
    throw new Error('Failed to query device consumption data from DynamoDB.');
  }
};

const snsPublish = async (PreferenceData,dailyBudgetLimit,totalCost,totalConsumption,userId) => {
    console.log(`dailyBudgetLimit FROM PREFERENCE: ${dailyBudgetLimit}`);
    if (totalCost >= dailyBudgetLimit   ){ //if total cost overrun budget / reach budget
      //push SNS to trigger notification
      //send over:
      //preferenceInfo + totalCost + dailyBudgetLimit
      let eventText = {
        preferenceData: PreferenceData[0],
        dailyBudgetLimit: dailyBudgetLimit,
        totalCost: totalCost,
        totalConsumption: totalConsumption,
        userId: userId
      }
      //s
      //FOR NOTIFI -> Publish SNS Topic
      
      var snsParams = {
        Message: JSON.stringify(eventText), 
        Subject: "SNS From UpdateDeviceConsumption Lambda",
        TopicArn: process.env.TopicArn
      }
      const snsResult = await sns.publish(snsParams).promise();
      
      console.log(`snsResult: ${JSON.stringify(snsResult)}`)
      return snsResult;
    }
}


const queryPreferenceDataFromDynamoDB = async (userId, uuid) => {
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
    // Extract userId and date from query parameters
    const snsMessage = JSON.parse(event.Records[0].Sns.Message)
    const userId =  snsMessage["userId"];
    let date = null
    if ('date' in snsMessage){
      date = snsMessage["date"];
    }

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing required query parameter: userId.',
        }),
      };
    }

    // Query DynamoDB for device consumption data with or without date
    const consumptionData = await queryDeviceConsumptionFromDynamoDB(userId,date);

    // Ensure that at least one item is returned
    if (consumptionData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Device consumption data not found for the specified userId and/or date.',
        }),
      };
    }

    // continue
    let totalConsumption = 0
    // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
    const costPerKwh = 0.365 //in $/kWh
    let totalCost = null
    try{
      for (let i = 0; i < consumptionData.length; i++) {
        let deviceRecord = consumptionData[i]
        let consumption = Number(deviceRecord["consumption"])
        let date = deviceRecord["endTime"].slice(0,10)
        console.log(`date: ${date}`)

        totalConsumption += consumption
        console.log(`consumptionData: ${JSON.stringify(totalConsumption)}`)        
      }
      
    }catch(err){
      console.log(`err:${err.status}`)
      console.log(`totalConsumption:${totalConsumption}`)
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: err,
        }),
      };
    }
    if (totalConsumption != 0){
      //calc total cost
      totalCost = totalConsumption * costPerKwh
    }
    // validate if overrun
    //retrieve preference data
    const PreferenceData = await queryPreferenceDataFromDynamoDB(userId,null);
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
    const dailyBudgetLimit = PreferenceData[0].budgets.dailyBudgetLimit

    const snsNotificationPublish = await snsPublish(PreferenceData,dailyBudgetLimit,totalCost,totalConsumption,userId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'cost data has been succesfully retrieved',
        data: totalConsumption, // Return the queried data
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
