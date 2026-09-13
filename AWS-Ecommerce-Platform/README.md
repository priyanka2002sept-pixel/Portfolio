# ☁️ Serverless E-Commerce Platform on AWS

A production-ready, cloud-native e-commerce platform built entirely on AWS serverless technologies.
Designed to showcase AWS Solutions Architect skills covering scalability, security, and cost optimisation.

> 📌 Built for **AWS Certified Solutions Architect – Associate (SAA-C03)** portfolio

---

## 🏗️ Architecture

```
User → Route 53 → CloudFront → S3 (Frontend)
                      ↓
User → API Gateway → Lambda Functions → DynamoDB
                      ↓                    ↓
                   Cognito              SQS/SNS
                   (Auth)            (Order Events)
                      ↓
                  CloudWatch (Monitoring)
```

---

## 🛠️ AWS Services Used (All Free Tier)

| Service | Purpose | Free Tier |
|---|---|---|
| S3 | Frontend hosting | 5 GB/month |
| CloudFront | CDN | 1 TB transfer |
| API Gateway | REST API | 1M calls/month |
| Lambda | Backend logic | 1M requests/month |
| DynamoDB | Database | 25 GB storage |
| Cognito | Authentication | 50K MAU |
| SQS | Order queue | 1M requests/month |
| SNS | Notifications | 1M publishes |
| CloudWatch | Monitoring | 5 GB logs |
| IAM | Security roles | Always free |
| CloudFormation | IaC | Always free |

**Total cost: £0/month** ✅

---

## 📁 Project Structure

```
AWS-Ecommerce-Platform/
├── .github/workflows/deploy.yml   # CI/CD pipeline
├── infrastructure/                # CloudFormation (IaC)
│   ├── dynamodb.yaml
│   ├── cognito.yaml
│   ├── s3-cloudfront.yaml
│   └── monitoring.yaml
├── terraform/                     # Terraform alternative
│   ├── main.tf
│   ├── variables.tf
│   ├── resources.tf
│   └── outputs.tf
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── backend/tests/
│   └── test_lambda.py
├── scripts/
│   ├── deploy.sh
│   └── destroy.sh
└── docs/
    ├── how-it-works.md
    ├── architecture.md
    └── cost-analysis.md
```

---

## 🚀 Deploy

```bash
# CloudFormation
bash scripts/deploy.sh

# Terraform
cd terraform && terraform init && terraform apply

# Destroy after demo (stay free tier!)
bash scripts/destroy.sh

# Run tests (no AWS account needed)
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

## 🔐 Security Features
- IAM least privilege — every Lambda has a scoped role
- Cognito JWT — all API routes protected
- Private S3 — CloudFront OAI only
- DynamoDB encryption at rest

---

## 📖 Docs
- [How It Works (Plain English)](docs/how-it-works.md)
- [Architecture Decisions](docs/architecture.md)
- [Cost Analysis](docs/cost-analysis.md)

---

## 👤 Author
Portfolio project for AWS Certified Solutions Architect – Associate (SAA-C03)
