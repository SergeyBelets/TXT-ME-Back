# Run SAM Local API with a custom DynamoDB endpoint.
# 1. Spins Lambdas defined in template.yaml.
# 2. Injects environment variables from locals.json (overriding DYNAMODB_URL defined in template.yaml).

sam local start-api --env-vars locals.json