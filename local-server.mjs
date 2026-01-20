import express from 'express';
import cors from 'cors';

// Import Lambda handlers
import { handler as authRegister } from './auth/AuthRegister/index.mjs';
import { handler as authLogin } from './auth/AuthLogin/index.mjs';
import { handler as usersGetProfile } from './users/UsersGetProfile/index.mjs';
import { handler as postCreate } from './posts/PostCreate/index.mjs';
import { handler as postsList } from './posts/PostsList/index.mjs';
import { handler as postsGet } from './posts/PostsGet/index.mjs';
import { handler as postsRecent } from './posts/PostsRecent/index.mjs';
import { handler as postDelete } from './posts/PostDelete/index.mjs';
import { handler as commentCreate } from './comments/CommentCreate/index.mjs';
import { handler as commentsList } from './comments/CommentsList/index.mjs';
import { handler as commentDelete } from './comments/CommentDelete/index.mjs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper function to create Lambda event from Express request
function createLambdaEvent(req) {
  return {
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': req.headers['x-user-id'] || '',
      ...req.headers
    },
    pathParameters: req.params,
    queryStringParameters: req.query,
    httpMethod: req.method,
    path: req.path
  };
}

// Helper function to handle Lambda response
function sendLambdaResponse(res, lambdaResponse) {
  const statusCode = lambdaResponse.statusCode || 200;
  const headers = lambdaResponse.headers || {};
  const body = lambdaResponse.body;
  
  // Set headers
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });
  
  // Send response
  res.status(statusCode).send(body);
}

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await authRegister(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await authLogin(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User routes
app.get('/users/profile', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await usersGetProfile(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post routes
app.post('/posts', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await postCreate(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await postsList(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/posts/recent', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await postsRecent(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/posts/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await postsGet(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/posts/:postId', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await postDelete(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Comment routes
app.post('/comments', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await commentCreate(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/comments/:postId', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await commentsList(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/comments/:commentId', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await commentDelete(event);
    sendLambdaResponse(res, response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  console.log(`DynamoDB should be running at http://localhost:8000`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST   /auth/register`);
  console.log(`  POST   /auth/login`);
  console.log(`  GET    /users/profile`);
  console.log(`  POST   /posts`);
  console.log(`  GET    /posts`);
  console.log(`  GET    /posts/recent`);
  console.log(`  GET    /posts/:id`);
  console.log(`  DELETE /posts/:postId`);
  console.log(`  POST   /comments`);
  console.log(`  GET    /comments/:postId`);
  console.log(`  DELETE /comments/:commentId`);
});
