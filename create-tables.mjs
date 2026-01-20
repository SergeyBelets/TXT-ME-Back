import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ 
  region: "eu-north-1", 
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: 'MOCKACCESSKEY1234567',
    secretAccessKey: 'mocksecretkey12345678901234567890123456'
  },
  maxAttempts: 2,
  requestHandler: {
    requestTimeout: 5000
  }
});

console.log('Testing DynamoDB connection...');

async function createUsersTable() {
  try {
    await client.send(new CreateTableCommand({
      TableName: 'CMS-Users',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'username-index',
          KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Created CMS-Users table with username-index');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('CMS-Users table already exists');
    } else {
      console.error('Error creating CMS-Users:', error.message);
    }
  }
}

async function createPostsTable() {
  try {
    await client.send(new CreateTableCommand({
      TableName: 'CMS-Posts',
      KeySchema: [
        { AttributeName: 'postId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'postId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'N' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'createdAt-index',
          KeySchema: [
            { AttributeName: 'createdAt', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Created CMS-Posts table');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('CMS-Posts table already exists');
    } else {
      console.error('Error creating CMS-Posts:', error.message);
    }
  }
}

async function createCommentsTable() {
  try {
    await client.send(new CreateTableCommand({
      TableName: 'CMS-Comments',
      KeySchema: [
        { AttributeName: 'commentId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'commentId', AttributeType: 'S' },
        { AttributeName: 'postId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'N' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'postId-index',
          KeySchema: [
            { AttributeName: 'postId', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Created CMS-Comments table');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('CMS-Comments table already exists');
    } else {
      console.error('Error creating CMS-Comments:', error.message);
    }
  }
}

async function createTagsTable() {
  try {
    await client.send(new CreateTableCommand({
      TableName: 'CMS-Tags',
      KeySchema: [
        { AttributeName: 'tagId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'tagId', AttributeType: 'S' },
        { AttributeName: 'name', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'name-index',
          KeySchema: [
            { AttributeName: 'name', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Created CMS-Tags table');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('CMS-Tags table already exists');
    } else {
      console.error('Error creating CMS-Tags:', error.message);
    }
  }
}

async function listTables() {
  const response = await client.send(new ListTablesCommand({}));
  console.log('\nCurrent tables:');
  response.TableNames.forEach(table => console.log(`  - ${table}`));
}

async function main() {
  console.log('Creating DynamoDB tables...\n');
  await createUsersTable();
  await createPostsTable();
  await createCommentsTable();
  await createTagsTable();
  await listTables();
  console.log('\nDatabase setup complete!');
}

main().catch(console.error);
