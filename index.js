const AWS = require('aws-sdk');
const s3 = new AWS.S3();
exports.uploadImage = async (event, context) => {
  try {
    const bucketName = "testbucket-08";
    const { imageFile } = JSON.parse(event.body);
    const base64Data = imageFile.replace(/^data:image\/\w+;base64,/, ''); // Remove the data:image/png;base64, prefix
    const buffer = Buffer.from(base64Data, 'base64');
    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}_uploaded_image.png`, // You can adjust the file name or extension as needed
      Body: buffer,
      ContentType: 'image/png', // Set the content type based on the image type
    };
    await s3.putObject(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image uploaded successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};



exports.getImage = async (event, context) => {
  try {
    const bucketName = "testbucket-08";
    const key = event.queryStringParameters.key; // Retrieve the key of the image from the query string
    console.log("🚀 ~ file: index.js:34 ~ exports.getImage= ~ key:", key)

    const params = {
      Bucket: bucketName,
      Key: key,
    };


    const data = await s3.getObject(params).promise();

    // Return the image as a response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': data.ContentType,
      },
      body: data.Body.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.allImages = async (event, context) => {
   try {
    const params = {
      Bucket: "testbucket-08",
    };

    const data = await s3.listObjectsV2(params).promise();

    // Extract the list of objects (files) and generate URLs for each object
    const files = data.Contents.map((object) => {
      const imageUrl = s3.getSignedUrl('getObject', {
        Bucket: "testbucket-08",
        Key: object.Key,
        Expires: 3600, 
      });

      return {
        Key: object.Key,
        Size: object.Size,
        LastModified: object.LastModified,
        Url: imageUrl,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ files }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};