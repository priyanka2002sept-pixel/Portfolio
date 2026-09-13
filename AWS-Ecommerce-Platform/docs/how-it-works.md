# How It Works — Plain English

## The Big Picture
Think of this as a shopping website where every piece is a managed AWS service.
You only pay when someone actually uses it.

```
Customer visits  -> CloudFront serves page from S3
Customer browses -> API Gateway -> Lambda -> DynamoDB (reads products)
Customer orders  -> API Gateway -> Lambda -> DynamoDB (saves order)
                                          -> SQS (queue for processing)
                                          -> SNS (email confirmation)
```

## Services Explained Simply

### S3 — The File Cabinet
Stores your HTML/CSS/JS files. Like Google Drive but for websites.
Cost: fractions of a penny per GB.

### CloudFront — The Speed Layer
Copies your website to 400+ locations worldwide.
Whoever visits gets served from the nearest location.
Also adds HTTPS and keeps S3 private.

### API Gateway — The Receptionist
Receives requests from the browser and routes them to the right Lambda.
Also validates JWT tokens, handles rate limiting and CORS.

### Lambda — The Worker
Runs your code ONLY when needed. No server running 24/7.
Like hiring someone who only shows up when there is work, does it in seconds, then leaves.
You pay per millisecond of execution.

### DynamoDB — The Database
A fast NoSQL database. No servers to manage.
Costs £0 at idle — no minimum instance charge.
25 GB free tier — more than enough for a portfolio project.

### Cognito — The Bouncer
Handles sign-up, login and issues JWT tokens.
API Gateway checks the token on every request.
Handles password hashing, MFA, email verification — all free up to 50K users.

### SQS — The Queue
Order placed -> saved to DynamoDB -> sent to SQS queue for async processing.
Customer gets instant confirmation. Processing happens in the background.
Dead Letter Queue catches any failures after 3 retries.

### SNS — The Megaphone
Publishes one message -> delivered to all subscribers.
Order placed -> customer gets email confirmation instantly.

### CloudFormation — The Blueprint
Write infrastructure as YAML. Deploy with one command.
Tear down with one command. Zero ongoing cost when not in use.

## Interview Cheat Sheet

| Question | Answer |
|---|---|
| Why serverless? | No idle costs, auto-scales, no OS management |
| Why DynamoDB not RDS? | No minimum charge, scales automatically, free tier better |
| How is it secure? | Cognito JWT, IAM least privilege, private S3, HTTPS |
| How does it scale? | Lambda scales to thousands of concurrent executions automatically |
| How much does it cost? | £0/month on free tier for a portfolio project |
| How do you deploy? | One command: bash scripts/deploy.sh — CloudFormation IaC |
