#!/bin/bash

# Backup script for CMS-Posts
# This script can be triggered by cron or manually

# Set the directory to the script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Set environment variables if needed
export DYNAMODB_URL="http://localhost:8000"

# Run the backup
echo "Starting CMS-Posts backup..."
node backup-posts.mjs

# Check exit code
if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $(date)"
else
    echo "Backup failed at $(date)"
    exit 1
fi
