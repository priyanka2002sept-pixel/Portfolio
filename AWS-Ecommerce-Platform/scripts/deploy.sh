#!/bin/bash
# Deploy script (Mac / Linux / Git Bash on Windows)
REGION=${1:-us-east-1}
ENVIRONMENT=${2:-dev}
PROJECT_NAME="serverless-ecommerce"
ALERT_EMAIL=${3:-YOUR_EMAIL_ADDRESS}
TEMPLATE_BUCKET="$PROJECT_NAME-templates-$ENVIRONMENT"

echo "Deploying $PROJECT_NAME to $REGION..."
aws s3 mb s3://$TEMPLATE_BUCKET --region $REGION 2>/dev/null || true
aws s3 sync ./infrastructure/ s3://$TEMPLATE_BUCKET/infrastructure/ --region $REGION

for STACK in dynamodb cognito s3-cloudfront monitoring; do
  echo "Deploying $STACK stack..."
  aws cloudformation deploy \
    --template-file ./infrastructure/$STACK.yaml \
    --stack-name "$PROJECT_NAME-$STACK-$ENVIRONMENT" \
    --parameter-overrides Environment=$ENVIRONMENT ProjectName=$PROJECT_NAME AlertEmail=$ALERT_EMAIL \
    --capabilities CAPABILITY_IAM \
    --region $REGION \
    --no-fail-on-empty-changeset
done

echo "Done! Check the AWS Console for your resources."
