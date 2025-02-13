import axios from 'axios';
import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'WeatherTable';

// Function to insert data into DynamoDB
const insertDataIntoDynamoDB = async (transformedData) => {
  try {
    for (const item of transformedData) {
      const params = {
        TableName: tableName,
        Item: {
          Location: item.name, // Matches the partition key in the table schema
          Timestamp: new Date().toISOString(), // Matches the sort key in the table schema
          latitude: item.label_location.latitude,
          longitude: item.label_location.longitude,
          forecast: item.forecast,
        },
      };

      await dynamoDB.put(params).promise();
      console.log(`Inserted item into DynamoDB: ${JSON.stringify(params.Item)}`);
    }
  } catch (error) {
    console.error('Error inserting data into DynamoDB:', error);
    throw new Error('Failed to insert data into DynamoDB.');
  }
};

// Main handler function
export const lambdaHandler = async (event, context) => {
  const options = {
    method: 'GET',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
  };

  try {
    // Fetch the weather data
    const { data } = await axios.request(options);

    // Handle API response codes
    if (data.code === 4) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request. Please check the API documentation.',
        }),
      };
    } else if (data.code === 17) {
      return {
        statusCode: 503,
        body: JSON.stringify({
          message: 'Service is temporarily unavailable. Please try again later.',
        }),
      };
    } else if (data.code !== 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unexpected error occurred.',
        }),
      };
    }

    // Transform the data
    const transformedData = data?.data?.items[0]?.forecasts.map((forecast) => {
      const areaMetadata = data.data.area_metadata.find(
        (area) => area.name === forecast.area
      );
      return {
        name: forecast.area,
        label_location: areaMetadata?.label_location || {},
        forecast: forecast.forecast,
      };
    });

    console.log('Transformed Data:', transformedData);

    // Call the function to insert data into DynamoDB
    await insertDataIntoDynamoDB(transformedData);

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Weather data successfully fetched and inserted into DynamoDB.',
        data: transformedData,
      }),
    };
  } catch (error) {
    console.error('Error:', error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the weather data.',
        error: error.message,
      }),
    };
  }
};
