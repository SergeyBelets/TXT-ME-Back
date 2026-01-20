import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { writeFileSync, readdirSync, unlinkSync, statSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Configure DynamoDB client
const endpoint = process.env.DYNAMODB_URL || 'http://localhost:8000';
const client = new DynamoDBClient({ 
  region: 'eu-north-1',
  endpoint 
});
const docClient = DynamoDBDocumentClient.from(client);

const BACKUP_DIR = './backups';
const RETENTION_DAYS = 10;

async function backupPosts() {
  try {
    console.log(`Starting backup at ${new Date().toISOString()}`);
    
    // Ensure backup directory exists
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Scan all posts from DynamoDB
    const result = await docClient.send(new ScanCommand({
      TableName: "CMS-Posts"
    }));

    if (!result.Items || result.Items.length === 0) {
      console.log('No posts found to backup');
      return;
    }

    // Sort by createdAt descending and get the 20 most recent
    const sortedPosts = result.Items
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);

    // Create backup file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `posts-backup-${timestamp}.json`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);

    // Write backup file
    writeFileSync(
      backupFilePath, 
      JSON.stringify({
        backupDate: new Date().toISOString(),
        postCount: sortedPosts.length,
        posts: sortedPosts
      }, null, 2)
    );

    console.log(`Backed up ${sortedPosts.length} posts to ${backupFilePath}`);

    // Clean up old backups
    cleanupOldBackups();

  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

function cleanupOldBackups() {
  try {
    const files = readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach(file => {
      if (file.startsWith('posts-backup-') && file.endsWith('.json')) {
        const filePath = join(BACKUP_DIR, file);
        const stats = statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > retentionMs) {
          unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old backup: ${file}`);
        }
      }
    });

    if (deletedCount === 0) {
      console.log('No old backups to clean up');
    } else {
      console.log(`Cleaned up ${deletedCount} old backup(s)`);
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run backup
backupPosts();
