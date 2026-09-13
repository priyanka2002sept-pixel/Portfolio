# Cost Analysis

## Free Tier Monthly Estimate (Portfolio Traffic)

| Service | Free Tier | Usage | Cost |
|---|---|---|---|
| Lambda | 1M requests | ~10K | £0 |
| API Gateway | 1M calls | ~10K | £0 |
| DynamoDB | 25 GB | < 1 GB | £0 |
| S3 | 5 GB | ~50 MB | £0 |
| CloudFront | 1 TB | ~500 MB | £0 |
| Cognito | 50K MAU | < 10 | £0 |
| SNS | 1M publishes | ~1K | £0 |
| SQS | 1M requests | ~1K | £0 |
| TOTAL | | | £0/month |

## Cost Optimisation Strategies
1. DynamoDB PAY_PER_REQUEST — zero cost when idle
2. Lambda 128MB memory — minimum allocation
3. CloudFront PriceClass_100 — cheapest edge locations only
4. No NAT Gateway — saves ~£32/month
5. Destroy after demo: bash scripts/destroy.sh
