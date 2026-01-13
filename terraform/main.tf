provider "aws" {
  region                      = "eu-north-1"
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  # Если разворачиваем локально, направляем на Docker-контейнер
  endpoints {
    dynamodb = "http://localhost:8000"
  }
}

# --- TABLE: CMS-Users ---
resource "aws_dynamodb_table" "users" {
  name         = "CMS-Users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute { name = "userId"   type = "S" }
  attribute { name = "username" type = "S" }

  global_secondary_index {
    name            = "UsernameIndex"
    hash_key        = "username"
    projection_type = "ALL"
  }
}

# --- TABLE: CMS-Posts ---
resource "aws_dynamodb_table" "posts" {
  name         = "CMS-Posts"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "postId"

  attribute { name = "postId"    type = "S" }
  attribute { name = "userId"    type = "S" }
  attribute { name = "createdAt" type = "N" }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "createdAt-index"
    hash_key        = "createdAt"
    projection_type = "ALL"
  }
}

# --- TABLE: CMS-Comments ---
resource "aws_dynamodb_table" "comments" {
  name         = "CMS-Comments"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "commentId"

  attribute { name = "commentId" type = "S" }
  attribute { name = "postId"    type = "S" }
  attribute { name = "createdAt" type = "N" }

  global_secondary_index {
    name            = "postId-index"
    hash_key        = "postId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
}

# --- TABLE: CMS-Tags ---
resource "aws_dynamodb_table" "tags" {
  name         = "CMS-Tags"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tagId"

  attribute { name = "tagId" type = "S" }
  attribute { name = "name"  type = "S" }

  global_secondary_index {
    name            = "name-index"
    hash_key        = "name"
    projection_type = "ALL"
  }
}
