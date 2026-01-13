const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({ region: 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const JWT_SECRET = "cms-jwt-secret-change-in-production";

exports.handler = async (event) => {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    console.log('Event headers:', JSON.stringify(event.headers));
    
    let token = event.headers?.Authorization || event.headers?.authorization;
    console.log('Raw token:', token);
    
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    if (!token) {
      console.log('No token found');
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Missing token' }) };
    }
    
    console.log('Token length:', token.length);
    const userToken = jwt.verify(token, JWT_SECRET);
    console.log('User ID:', userToken.userId);

    const avatarId = event.pathParameters?.avatarId;
    if (!avatarId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing avatarId' }) };
    }

    const userResult = await docClient.send(new GetCommand({
      TableName: "CMS-Users",
      Key: { userId: userToken.userId }
    }));

    const avatars = userResult.Item?.avatars || [];
    const avatarExists = avatars.some(a => a.avatarId === avatarId);
    if (!avatarExists) {
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Avatar not found' }) };
    }

    await docClient.send(new UpdateCommand({
      TableName: "CMS-Users",
      Key: { userId: userToken.userId },
      UpdateExpression: "SET activeAvatarId = :avatarId, updatedAt = :now",
      ExpressionAttributeValues: {
        ":avatarId": avatarId,
        ":now": new Date().toISOString()
      }
    }));

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Active avatar set', avatarId }) };
  } catch (error) {
    console.error('Full error:', error.message, error.stack);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: error.message }) };
  }
};
