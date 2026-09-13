#!/bin/bash
REGION=${1:-us-east-1}
ENVIRONMENT=${2:-dev}
PROJECT_NAME="serverless-ecommerce"

read -p "Type YES to destroy all stacks: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then echo "Cancelled."; exit 1; fi

for STACK in monitoring s3-cloudfront cognito dynamodb; do
  echo "Deleting $PROJECT_NAME-$STACK-$ENVIRONMENT ..."
  aws cloudformation delete-stack --stack-name "$PROJECT_NAME-$STACK-$ENVIRONMENT" --region $REGION
  aws cloudformation wait stack-delete-complete --stack-name "$PROJECT_NAME-$STACK-$ENVIRONMENT" --region $REGION 2>/dev/null
  echo "Deleted."
done
echo "All resources destroyed. Cost = 0."
