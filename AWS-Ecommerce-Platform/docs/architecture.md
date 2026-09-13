# Architecture Decisions

## Why Serverless over EC2?
- EC2 charges 24/7. Lambda charges per invocation (1M free/month)
- Lambda auto-scales with zero configuration
- No OS patching or server management

## Why DynamoDB over RDS?
- No minimum instance charge — £0 at idle
- PAY_PER_REQUEST billing
- Free tier: 25 GB vs RDS 20 GB with limited instance types
- Better suited for e-commerce access patterns

## Why CloudFront in front of S3?
- S3 bucket stays private (OAI)
- Automatic HTTPS
- Edge caching reduces latency globally
- Cheaper data transfer

## Why Cognito?
- OAuth2/OIDC compliant, handles token rotation
- Native API Gateway integration
- 50,000 MAU free
- GDPR compliant user data handling

## Why SQS + SNS?
- Order confirmed instantly, processing async
- Resilient — if downstream fails, message retries
- Dead Letter Queue for failed messages
- Standard event-driven architecture pattern

## Security
- IAM least privilege on every Lambda
- Private S3 with CloudFront OAI
- Cognito JWT validated at API Gateway
- DynamoDB encryption at rest

## What to Add in Production
1. WAF — Web Application Firewall
2. VPC — Private subnets
3. KMS — Customer-managed encryption keys
4. Secrets Manager — For API keys
5. X-Ray — Distributed tracing
6. CloudTrail — Audit logging
7. Route 53 — Custom domain
