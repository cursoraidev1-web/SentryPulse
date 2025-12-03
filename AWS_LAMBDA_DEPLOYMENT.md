# SentryPulse - AWS Lambda Serverless Deployment

Deploy SentryPulse using AWS Lambda for **automatic scaling** and **pay-per-use** pricing.

## Why Lambda?

### Cost Comparison

**Traditional EC2:**
- EC2 t3.medium: $30/month (always running)
- **Minimum**: $30/month even with no traffic

**Lambda Serverless:**
- API calls: $0.20 per 1M requests
- Compute: $0.0000166667 per GB-second
- **1000 users/day**: ~$5-15/month
- **10,000 users/day**: ~$30-50/month
- **100,000 users/day**: ~$200-300/month

### Benefits
✅ Pay only for actual usage
✅ Auto-scales from 0 to millions
✅ No server management
✅ Built-in high availability
✅ Perfect for variable traffic

### Considerations
⚠️ Cold starts (1-2 seconds first request)
⚠️ 15-minute execution limit
⚠️ Requires architectural changes

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               CloudFront (CDN)                   │
│  - Frontend static assets                       │
│  - Global edge caching                          │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐    ┌──────────────────────┐
│   S3    │    │   API Gateway        │
│ Static  │    │   - REST API         │
│ Website │    │   - Auth             │
└─────────┘    └──────┬───────────────┘
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
      ┌──────────┐      ┌──────────┐
      │  Lambda  │      │  Lambda  │
      │ Backend  │      │ Workers  │
      │  API     │      │  Cron    │
      └────┬─────┘      └────┬─────┘
           │                 │
    ┌──────┴────────┬────────┴────────┐
    │               │                 │
    ▼               ▼                 ▼
┌─────────┐  ┌──────────┐     ┌──────────┐
│   RDS   │  │   SQS    │     │ EventBridge│
│ Aurora  │  │  Queue   │     │   Cron    │
│Serverless│  └──────────┘     └──────────┘
└─────────┘
```

---

## Cost Estimate (Lambda)

### Low Traffic (1,000 users/day)
| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda API | 100K requests | $0.20 |
| Lambda Compute | 50 GB-hours | $0.83 |
| API Gateway | 100K requests | $0.35 |
| RDS Aurora Serverless | 2 ACUs min | $45 |
| S3 + CloudFront | 10 GB | $2 |
| **Total** | | **~$48/month** |

### Medium Traffic (10,000 users/day)
| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda API | 1M requests | $2 |
| Lambda Compute | 500 GB-hours | $8.33 |
| API Gateway | 1M requests | $3.50 |
| RDS Aurora Serverless | 2-4 ACUs | $60 |
| S3 + CloudFront | 100 GB | $10 |
| **Total** | | **~$84/month** |

### High Traffic (100,000 users/day)
| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda API | 10M requests | $20 |
| Lambda Compute | 5,000 GB-hours | $83 |
| API Gateway | 10M requests | $35 |
| RDS Aurora Serverless | 4-8 ACUs | $120 |
| S3 + CloudFront | 1 TB | $85 |
| **Total** | | **~$343/month** |

**Key Advantage**: With Lambda, you only pay for what you use. Zero traffic = ~$45/month minimum (just database).

---

## Prerequisites

```bash
# Install Serverless Framework
npm install -g serverless

# Install AWS SAM CLI (alternative)
brew install aws-sam-cli  # macOS
# or
pip install aws-sam-cli   # Python

# Configure AWS credentials
aws configure
```

---

## Option 1: Serverless Framework (Recommended)

### Step 1: Prepare Backend for Lambda

Create `backend/serverless.yml`:

```yaml
service: sentrypulse-backend

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  stage: ${opt:stage, 'prod'}
  memorySize: 1024
  timeout: 30
  environment:
    NODE_ENV: production
    DB_HOST: ${self:custom.dbHost}
    DB_NAME: sentrypulse
    DB_USER: ${ssm:/sentrypulse/db-user}
    DB_PASSWORD: ${ssm:/sentrypulse/db-password~true}
    REDIS_HOST: ${self:custom.redisHost}
    JWT_SECRET: ${ssm:/sentrypulse/jwt-secret~true}
  
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - sqs:SendMessage
            - sqs:ReceiveMessage
            - sqs:DeleteMessage
          Resource: !GetAtt MonitorQueue.Arn
        - Effect: Allow
          Action:
            - ssm:GetParameter
          Resource: arn:aws:ssm:${self:provider.region}:*:parameter/sentrypulse/*

custom:
  dbHost: !GetAtt AuroraCluster.Endpoint.Address
  redisHost: !GetAtt RedisCluster.PrimaryEndpoint.Address

functions:
  api:
    handler: dist/lambda.handler
    events:
      - httpApi:
          path: /api/{proxy+}
          method: ANY
      - httpApi:
          path: /api
          method: ANY
    vpc:
      securityGroupIds:
        - !GetAtt LambdaSecurityGroup.GroupId
      subnetIds:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB

  monitorWorker:
    handler: dist/lambda-worker.monitorHandler
    timeout: 300
    events:
      - sqs:
          arn: !GetAtt MonitorQueue.Arn
          batchSize: 1
    vpc:
      securityGroupIds:
        - !GetAtt LambdaSecurityGroup.GroupId
      subnetIds:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB

  monitorScheduler:
    handler: dist/lambda-cron.scheduleMonitors
    events:
      - schedule: rate(1 minute)
    vpc:
      securityGroupIds:
        - !GetAtt LambdaSecurityGroup.GroupId
      subnetIds:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB

  analyticsAggregator:
    handler: dist/lambda-cron.aggregateAnalytics
    timeout: 300
    events:
      - schedule: cron(0 1 * * ? *)  # Daily at 1 AM
    vpc:
      securityGroupIds:
        - !GetAtt LambdaSecurityGroup.GroupId
      subnetIds:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB

resources:
  Resources:
    # VPC
    VPC:
      Type: AWS::EC2::VPC
      Properties:
        CidrBlock: 10.0.0.0/16
        EnableDnsHostnames: true
        EnableDnsSupport: true
        Tags:
          - Key: Name
            Value: sentrypulse-vpc

    # Aurora Serverless
    AuroraCluster:
      Type: AWS::RDS::DBCluster
      Properties:
        Engine: aurora-mysql
        EngineMode: serverless
        DatabaseName: sentrypulse
        MasterUsername: admin
        MasterUserPassword: ${ssm:/sentrypulse/db-password~true}
        ScalingConfiguration:
          AutoPause: true
          MinCapacity: 2
          MaxCapacity: 16
          SecondsUntilAutoPause: 300
        VpcSecurityGroupIds:
          - !GetAtt DatabaseSecurityGroup.GroupId
        DBSubnetGroupName: !Ref DBSubnetGroup

    # ElastiCache Redis
    RedisCluster:
      Type: AWS::ElastiCache::CacheCluster
      Properties:
        CacheNodeType: cache.t3.micro
        Engine: redis
        NumCacheNodes: 1
        VpcSecurityGroupIds:
          - !GetAtt RedisSecurityGroup.GroupId
        CacheSubnetGroupName: !Ref RedisSubnetGroup

    # SQS Queue for async monitor checks
    MonitorQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: sentrypulse-monitors
        VisibilityTimeout: 300
        MessageRetentionPeriod: 86400

plugins:
  - serverless-plugin-typescript
  - serverless-offline

package:
  patterns:
    - '!node_modules/**'
    - '!.git/**'
    - '!.vscode/**'
    - '!*.md'
```

### Step 2: Create Lambda Handlers

Create `backend/src/lambda.ts`:

```typescript
import serverless from 'serverless-http';
import app from './index';

// Wrap Express app for Lambda
export const handler = serverless(app);
```

Create `backend/src/lambda-worker.ts`:

```typescript
import { SQSHandler } from 'aws-lambda';
import { MonitoringService } from './services/MonitoringService';
import { MonitorRepository } from './repositories/MonitorRepository';
import { IncidentRepository } from './repositories/IncidentRepository';

export const monitorHandler: SQSHandler = async (event) => {
  const monitoringService = new MonitoringService(
    new MonitorRepository(),
    new IncidentRepository()
  );

  for (const record of event.Records) {
    const { monitorId } = JSON.parse(record.body);
    
    try {
      const monitor = await new MonitorRepository().findById(monitorId);
      if (monitor) {
        await monitoringService.checkMonitor(monitor);
      }
    } catch (error) {
      console.error('Monitor check failed:', error);
      throw error; // Retry via SQS
    }
  }
};
```

Create `backend/src/lambda-cron.ts`:

```typescript
import { ScheduledHandler } from 'aws-lambda';
import { MonitorRepository } from './repositories/MonitorRepository';
import { SQS } from 'aws-sdk';
import { AnalyticsService } from './services/AnalyticsService';

const sqs = new SQS();
const QUEUE_URL = process.env.MONITOR_QUEUE_URL!;

export const scheduleMonitors: ScheduledHandler = async (event) => {
  const monitorRepo = new MonitorRepository();
  const monitors = await monitorRepo.findEnabled();

  // Queue monitors that need checking
  for (const monitor of monitors) {
    if (shouldCheck(monitor)) {
      await sqs.sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({ monitorId: monitor.id }),
      }).promise();
    }
  }

  console.log(`Queued ${monitors.length} monitors for checking`);
};

export const aggregateAnalytics: ScheduledHandler = async (event) => {
  const analyticsService = new AnalyticsService();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().split('T')[0];

  await analyticsService.aggregateDailyStats(date);
  console.log(`Aggregated analytics for ${date}`);
};

function shouldCheck(monitor: any): boolean {
  if (!monitor.last_checked_at) return true;
  const lastChecked = new Date(monitor.last_checked_at).getTime();
  const nextCheck = lastChecked + monitor.interval * 1000;
  return Date.now() >= nextCheck;
}
```

### Step 3: Deploy Backend

```bash
cd backend

# Install dependencies
npm install serverless-http serverless-plugin-typescript serverless-offline aws-sdk

# Store secrets in SSM Parameter Store
aws ssm put-parameter \
  --name /sentrypulse/db-password \
  --value "YOUR_STRONG_PASSWORD" \
  --type SecureString

aws ssm put-parameter \
  --name /sentrypulse/jwt-secret \
  --value "$(openssl rand -base64 64)" \
  --type SecureString

aws ssm put-parameter \
  --name /sentrypulse/db-user \
  --value "admin" \
  --type String

# Deploy
serverless deploy --stage prod

# Run migrations (one-time)
# You'll need to run this from an EC2 instance or locally with VPN access
serverless invoke --function api --data '{"path": "/migrate", "httpMethod": "POST"}'
```

### Step 4: Deploy Frontend to S3 + CloudFront

Create `frontend/deploy-s3.sh`:

```bash
#!/bin/bash

# Build frontend
npm run build
npm run export  # Generate static files

# Create S3 bucket
aws s3 mb s3://sentrypulse-frontend-${RANDOM}

BUCKET_NAME=sentrypulse-frontend-${RANDOM}

# Upload to S3
aws s3 sync out/ s3://$BUCKET_NAME --delete

# Make public
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html

# Create CloudFront distribution
cat > cloudfront-config.json <<EOF
{
  "Comment": "SentryPulse Frontend",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": [{
    "Id": "S3-sentrypulse",
    "DomainName": "$BUCKET_NAME.s3-website-us-east-1.amazonaws.com",
    "CustomOriginConfig": {
      "HTTPPort": 80,
      "OriginProtocolPolicy": "http-only"
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-sentrypulse",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": ["GET", "HEAD"],
    "CachedMethods": ["GET", "HEAD"],
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  }
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

---

## Option 2: AWS SAM (Alternative)

### Step 1: Create SAM Template

Create `backend/template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: SentryPulse Serverless Application

Globals:
  Function:
    Runtime: nodejs20.x
    MemorySize: 1024
    Timeout: 30
    Environment:
      Variables:
        NODE_ENV: production
        DB_HOST: !GetAtt AuroraCluster.Endpoint.Address
        JWT_SECRET: '{{resolve:ssm-secure:/sentrypulse/jwt-secret}}'

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: dist/lambda.handler
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            Path: /api/{proxy+}
            Method: ANY

  MonitorWorkerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: dist/lambda-worker.monitorHandler
      Events:
        SQSEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt MonitorQueue.Arn

  MonitorQueue:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300

  AuroraCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-mysql
      EngineMode: serverless
      ScalingConfiguration:
        AutoPause: true
        MinCapacity: 2
        MaxCapacity: 16

Outputs:
  ApiUrl:
    Description: API Gateway URL
    Value: !Sub 'https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com'
```

### Step 2: Deploy with SAM

```bash
cd backend

# Build
sam build

# Deploy
sam deploy --guided

# Follow prompts:
# - Stack name: sentrypulse
# - Region: us-east-1
# - Confirm changes: Y
# - Allow SAM CLI IAM role creation: Y
```

---

## Frontend for Lambda

Update `frontend/next.config.js` for static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

Build and deploy:

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# The 'out' directory contains static files
# Upload to S3
aws s3 sync out/ s3://your-frontend-bucket/
```

---

## Database Migrations with Lambda

Since Lambda can't run long migrations, use one of these approaches:

### Option 1: Migration Lambda (One-time)

```typescript
// src/lambda-migrate.ts
import { Handler } from 'aws-lambda';
import { runMigrations } from './database/migrations';

export const handler: Handler = async () => {
  await runMigrations();
  return { statusCode: 200, body: 'Migrations complete' };
};
```

Deploy and invoke once:

```bash
serverless deploy function --function migrate
serverless invoke --function migrate
```

### Option 2: EC2 Bastion

```bash
# Launch small EC2 instance in same VPC
# SSH in and run migrations
npm run migrate

# Terminate instance
```

### Option 3: Cloud9 IDE

```bash
# Create Cloud9 environment in same VPC
# Run migrations from Cloud9 terminal
npm run migrate
```

---

## Monitoring & Debugging

### CloudWatch Logs

```bash
# View Lambda logs
serverless logs --function api --tail

# Or with AWS CLI
aws logs tail /aws/lambda/sentrypulse-prod-api --follow
```

### X-Ray Tracing

Add to `serverless.yml`:

```yaml
provider:
  tracing:
    lambda: true
    apiGateway: true
```

### Metrics

```bash
# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=sentrypulse-prod-api \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

---

## Performance Optimization

### 1. Provisioned Concurrency (Eliminate Cold Starts)

```yaml
functions:
  api:
    provisionedConcurrency: 2  # Keep 2 instances warm
```

**Cost**: $0.015 per GB-hour (in addition to regular Lambda costs)

### 2. VPC Connection Reuse

```typescript
// Enable connection reuse
process.env.DB_CONNECTION_REUSE = 'true';

// Use connection pooling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  connectionLimit: 1,  // Lambda = 1 connection per instance
});
```

### 3. Lambda Layers (Reduce Package Size)

```yaml
layers:
  nodeModules:
    path: layers/node_modules
    
functions:
  api:
    layers:
      - !Ref NodeModulesLambdaLayer
```

---

## Cost Optimization

### 1. Use Aurora Serverless v2

```yaml
AuroraCluster:
  Type: AWS::RDS::DBCluster
  Properties:
    Engine: aurora-mysql
    EngineVersion: 8.0.mysql_aurora.3.02.0
    ServerlessV2ScalingConfiguration:
      MinCapacity: 0.5  # Much cheaper minimum!
      MaxCapacity: 16
```

**Savings**: ~50% on database costs

### 2. S3 Intelligent-Tiering

```bash
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket sentrypulse-frontend \
  --id EntireBucket \
  --intelligent-tiering-configuration '{"Id":"EntireBucket","Status":"Enabled","Tierings":[{"Days":90,"AccessTier":"ARCHIVE_ACCESS"}]}'
```

### 3. CloudFront Free Tier

- 1 TB data transfer out per month (free)
- 10 million HTTP/HTTPS requests (free)

---

## Comparison: Lambda vs EC2

| Feature | Lambda | EC2 Simple |
|---------|--------|------------|
| **Min Cost** | ~$5/month | ~$40/month |
| **Scaling** | Automatic | Manual |
| **Cold Start** | 1-2 seconds | None |
| **Management** | None | SSH, updates |
| **Max Execution** | 15 minutes | Unlimited |
| **Perfect For** | Variable traffic | Consistent traffic |

---

## When to Use Lambda

✅ **Use Lambda if:**
- Variable/unpredictable traffic
- Starting small (<10K users/day)
- Want zero server management
- Need automatic scaling
- Budget-conscious

❌ **Use EC2 if:**
- High consistent traffic (>50K requests/day)
- Need WebSocket connections
- Long-running processes
- Complex stateful operations

---

## Complete Deployment Commands

```bash
# 1. Setup
npm install -g serverless
cd backend

# 2. Configure secrets
aws ssm put-parameter --name /sentrypulse/jwt-secret \
  --value "$(openssl rand -base64 64)" --type SecureString

# 3. Deploy backend
serverless deploy --stage prod

# 4. Run migrations (from EC2 or Cloud9)
npm run migrate

# 5. Build & deploy frontend
cd ../frontend
npm run build
aws s3 sync out/ s3://your-bucket/

# Done!
```

---

## Support

- **Serverless Framework**: https://www.serverless.com/framework/docs
- **AWS SAM**: https://docs.aws.amazon.com/serverless-application-model
- **AWS Lambda**: https://docs.aws.amazon.com/lambda

---

**Lambda deployment is perfect for SentryPulse!** 🚀

Start with Lambda, pay only $5-15/month for low traffic, and it automatically scales to handle millions of users!
