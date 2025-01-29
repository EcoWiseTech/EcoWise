import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const tableName = 'DeviceConsumptionTable';
const indexName = 'userId-startTime-index';
const preferenceTableName = 'PreferenceTable';



// Function to query device consumption data from DynamoDB
const queryDeviceConsumptionFromDynamoDB = async (userId,startDate,endDate) => {
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
    if (startDate) {
        params.KeyConditionExpression += 'AND startTime BETWEEN :startDate AND :endDate'; //between
        params.ExpressionAttributeValues[':endDate'] = endDate;
        params.ExpressionAttributeValues[':startDate'] = startDate;
    }

    console.log(`KeyConditionExpression: ${params.KeyConditionExpression}`)
    
    const result = await dynamoDB.query(params).promise();
    console.log(`Queried device consumption data for userId: ${userId} with startDate: ${startDate} and endDate: ${endDate}`);
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
    let startDate = null
    let endDate = null
    if ('startDate' in snsMessage && snsMessage["startDate"] != null){
      try{
        startDate = new Date(snsMessage["startDate"]).toISOString();
        console.log(`startDate HEREEE: ${startDate}`)
      }catch(e){
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization", 
          },
          body: JSON.stringify({
            message: 'Cannot Parse startDate into ISOstring',
          }),
        };
      }
    }
    const day = 60 * 60 * 24 * 1000;
    if ('endDate' in snsMessage ){
      if (snsMessage["endDate"] != null) {
        try{
          endDate = new Date(snsMessage["endDate"]);
          console.log(`actual endDate HEREEE: ${endDate}`)
          endDate = new Date(endDate.getTime() + day).toISOString();
          console.log(`after parse endDate HEREEE: ${endDate}`)
  
        }catch(e){
          return {
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Origin": "*", 
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization", 
            },
            body: JSON.stringify({
              message: 'Cannot Parse endDate into ISOstring',
            }),
          };
        }
      }else{
        console.log(`null so endaDate = startTDate`)

        endDate = new Date(snsMessage["startDate"]);
        console.log(`actual endDate HEREEE: ${endDate}`)
        endDate = new Date(endDate.getTime() + day).toISOString();
        console.log(`after parse endDate HEREEE: ${endDate}`)      }
      
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
    const consumptionData = await queryDeviceConsumptionFromDynamoDB(userId,startDate,endDate);
    
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
//start COMMENTED
    // continue
    let totalConsumption = 0
    // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
    const costPerKwh = 0.365 //in $/kWh
    let totalCost = null
    let dateList = []
    try{
      for (let i = 0; i < consumptionData.length; i++) {
        let deviceRecord = consumptionData[i]
        let consumption = Number(deviceRecord["consumption"])
        let date = deviceRecord["startTime"].slice(0,10)
        try{
          if (!dateList.includes(date)){
            dateList.push(date)
          }
        }catch(e){
          console.log(`error; ${e.error}`)
        }
        
        

        totalConsumption += consumption
        // console.log(`consumptionData: ${JSON.stringify(totalConsumption)}`)        
      }
      console.log("dateLIST:")
      for (let i = 0; i < dateList.length; i++) {
      console.log(`date: ${dateList[i]}`)
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
    if ("budgets" in PreferenceData[0] && "isBudgetNotification" in PreferenceData[0]["budgets"]){
      let isBudgetNotification = PreferenceData[0]["budgets"]["isBudgetNotification"]
      if (isBudgetNotification){
        const snsNotificationPublish = await snsPublish(PreferenceData,dailyBudgetLimit,totalCost,totalConsumption,userId);
      }
    }
    
//     //end COMMENTED

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'cost data has been succesfully retrieved',
        data: {totalConsumption,PreferenceData}, // Return the queried data
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
