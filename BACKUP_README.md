# CMS-Posts Backup Configuration

## Overview
This backup solution automatically backs up the 5 most recent posts from CMS-Posts table and retains backups for 10 days.

## Files
- `backup-posts.mjs` - Node.js script that performs the backup
- `backup-posts.sh` - Shell wrapper script for cron execution
- `backups/` - Directory where backup files are stored (created automatically)

## Manual Backup
Run the backup manually:
```bash
# Using the shell script
./backup-posts.sh

# Or directly with node
node backup-posts.mjs
```

## Automated Backup with Cron

### Setup Cron Job for Daily Backup at 12:00 UTC

1. Make the script executable:
```bash
chmod +x backup-posts.sh
```

2. Open crontab editor:
```bash
crontab -e
```

3. Add this line for daily backup at 12:00 UTC:
```cron
0 12 * * * <path_to>/backup-posts.sh >> <path_to>/TXT-ME-Back/backup.log 2>&1
```

**Note**: Replace the path with your actual project path.

### Other Cron Schedule Examples

```cron
# Every day at 12:00 UTC
0 12 * * * /path/to/backup-posts.sh

# Every 6 hours
0 */6 * * * /path/to/backup-posts.sh

# Every day at 2:00 AM
0 2 * * * /path/to/backup-posts.sh

# Every Monday at 12:00 UTC
0 12 * * 1 /path/to/backup-posts.sh

# Twice a day (12:00 and 00:00 UTC)
0 0,12 * * * /path/to/backup-posts.sh
```

## Using systemd Timer (Alternative to Cron)

### Create systemd service file
Create `/etc/systemd/system/cms-backup.service`:
```ini
[Unit]
Description=CMS Posts Backup Service
After=network.target

[Service]
Type=oneshot
User=yout_user
WorkingDirectory=<path_to>/TXT-ME-Back
ExecStart=<path_to>/TXT-ME-Back/backup-posts.sh
StandardOutput=append:<path_to>/TXT-ME-Back/backup.log
StandardError=append:<path_to>/TXT-ME-Back/backup.log
```

### Create systemd timer file
Create `/etc/systemd/system/cms-backup.timer`:
```ini
[Unit]
Description=CMS Posts Backup Timer
Requires=cms-backup.service

[Timer]
OnCalendar=*-*-* 12:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Enable and start the timer
```bash
sudo systemctl daemon-reload
sudo systemctl enable cms-backup.timer
sudo systemctl start cms-backup.timer

# Check timer status
sudo systemctl status cms-backup.timer

# List all timers
systemctl list-timers
```

## Backup File Format

Backup files are named: `posts-backup-YYYY-MM-DDTHH-MM-SS-mmmZ.json`

Example content:
```json
{
  "backupDate": "2026-01-20T12:00:00.000Z",
  "postCount": 5,
  "posts": [
    {
      "postId": "123-456-789",
      "title": "Post Title",
      "content": "Post content...",
      "userId": "user-id",
      "username": "username",
      "createdAt": 1768876189610,
      "updatedAt": 1768876189610,
      "tags": [],
      "commentCount": 0
    }
  ]
}
```

## Configuration

Edit `backup-posts.mjs` to customize:
- `RETENTION_DAYS` - How many days to keep backups (default: 10)
- Number of posts to backup (default: 5) - change `slice(0, 5)` to `slice(0, N)`

## Restoring from Backup

To restore posts from a backup file:
```bash
# View backup contents
cat backups/posts-backup-2026-01-20T12-00-00-000Z.json | jq '.posts'

# Restore using AWS CLI (example for one post)
aws dynamodb put-item \
  --table-name CMS-Posts \
  --endpoint-url http://localhost:8000 \
  --item file://post-item.json
```

## Logs

View backup logs:
```bash
# If using cron with log redirection
tail -f backup.log

# Or check system logs
journalctl -u cms-backup.service -f
```

## Troubleshooting

### Backup not running
1. Check cron is running: `systemctl status cron`
2. Check crontab syntax: `crontab -l`
3. Verify script permissions: `ls -la backup-posts.sh`
4. Check logs: `tail backup.log`

### DynamoDB connection issues
- Ensure DynamoDB Local is running
- Verify `DYNAMODB_URL` in `backup-posts.sh`
- Test connection: `aws dynamodb list-tables --endpoint-url http://localhost:8000`

### Disk space
Monitor backup directory size:
```bash
du -sh backups/
```

Example of manual start via node backup-posts.mjs (3 times):

$ node backup-posts.mjs
Starting backup at 2026-01-20T03:00:24.813Z
Backed up 12 posts to backups/posts-backup-2026-01-20T03-00-24-852Z.json
No old backups to clean up

$ ls
posts-backup-2026-01-20T02-54-21-885Z.json  posts-backup-2026-01-20T02-56-07-217Z.json  posts-backup-2026-01-20T03-00-24-852Z.json

$ cat posts-backup-2026-01-20T03-00-24-852Z.json
{
  "backupDate": "2026-01-20T03:00:24.852Z",
  "postCount": 12,
  "posts": [
    {
      "createdAt": 1768877747516,
      "postId": "54f2d4ca-38b1-4ca9-a474-8867bd01983b",
      "title": "test12",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test12",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768877747516,
      "commentCount": 0
    },
    {
      "createdAt": 1768876203868,
      "postId": "08b9c7d2-cf3c-4957-8929-e6856c512008",
      "title": "test11",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test11",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876203868,
      "commentCount": 0
    },
    {
      "createdAt": 1768876189610,
      "postId": "8a6df063-dc56-4668-a53e-3e1cc5580108",
      "title": "test10",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test10",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876189610,
      "commentCount": 0
    },
    {
      "createdAt": 1768876175172,
      "postId": "be7522a6-d9d5-49a0-8534-b05544b1105d",
      "title": "test9",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test9",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876175172,
      "commentCount": 0
    },
    {
      "createdAt": 1768876162747,
      "postId": "90fa8173-77e6-4a05-8fef-c70868e0856f",
      "title": "test8",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test8",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876162747,
      "commentCount": 0
    },
    {
      "createdAt": 1768876149572,
      "postId": "692d6e00-ac47-4d72-a03b-5f719c8e6e8b",
      "title": "test7",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test7",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876149572,
      "commentCount": 0
    },
    {
      "createdAt": 1768876127429,
      "postId": "5caabdac-429c-445a-a3da-8dd94dc20ad1",
      "title": "test6",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test6",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876127429,
      "commentCount": 0
    },
    {
      "createdAt": 1768876115694,
      "postId": "5ad122e1-1ad4-4e6f-9f9e-f1e7cb5279af",
      "title": "test5",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test5",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876115694,
      "commentCount": 0
    },
    {
      "createdAt": 1768876101531,
      "postId": "d4abd7b7-ffd7-4f3f-8916-f2cd4ac6188d",
      "title": "test4",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test4",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876101531,
      "commentCount": 0
    },
    {
      "createdAt": 1768876077334,
      "postId": "2e7497d6-752c-4d77-b3ff-c2fa97ba33a6",
      "title": "test3",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test3",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876077334,
      "commentCount": 0
    },
    {
      "createdAt": 1768876032053,
      "postId": "86c1375f-5aeb-42f5-9d57-40bef5649a6b",
      "title": "test2",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test2",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768876032053,
      "commentCount": 0
    },
    {
      "createdAt": 1768875994616,
      "postId": "7b159ef0-14d5-4a82-b2ce-9510d5afc6cb",
      "title": "test1",
      "userId": "c0b7fc4f-24ff-44a9-9f31-d3577e993975",
      "content": "test1",
      "username": "user1",
      "tags": [],
      "updatedAt": 1768875994616,
      "commentCount": 0
    }
  ]
}