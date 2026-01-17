#!/bin/bash
echo  "Starting Local DynamoDB..."
docker-compose up -d

echo "Creating Tables via Terraform..."
cd terraform
terraform init
terraform apply -auto-approve

echo "✅ Database is ready at http://localhost:8000"
