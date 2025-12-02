# SentryPulse AWS Deployment Guide

Complete guide to deploying SentryPulse on AWS infrastructure.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: Simple EC2 Deployment](#option-1-simple-ec2-deployment)
4. [Option 2: Production AWS Architecture](#option-2-production-aws-architecture)
5. [Setup Instructions](#setup-instructions)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backups & Disaster Recovery](#backups--disaster-recovery)
9. [Scaling Strategies](#scaling-strategies)
10. [Cost Estimation](#cost-estimation)
11. [Security Best Practices](#security-best-practices)

---

## Architecture Overview

### Simple Architecture (Low Cost)
```
Internet
    ↓
Route 53 (DNS)
    ↓
EC2 Instance (t3.medium)
├── Docker Compose
│   ├── Nginx
│   ├── Backend (Node.js)
│   ├── Frontend (Next.js)
│   ├── MySQL
│   └── Redis
└── EBS Volume (Data)
```

### Production Architecture (Scalable)
```
Internet
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
┌─────────────────────────────────────┐
│  Auto Scaling Group (EC2)           │
│  ├── Backend Instances (Node.js)    │
│  └── Frontend Instances (Next.js)   │
└─────────────────────────────────────┘
    ↓                           ↓
RDS MySQL                   ElastiCache Redis
(Multi-AZ)                  (Cluster Mode)
    ↓
S3 (Backups)
```

---

## Prerequisites

### AWS Account Setup
1. AWS account with billing enabled
2. AWS CLI installed locally
3. IAM user with appropriate permissions
4. Domain name (optional but recommended)

### Local Requirements
- AWS CLI v2
- SSH key pair
- Git
- Docker knowledge

### Install AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Configure
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

---

## Option 1: Simple EC2 Deployment

Perfect for development, staging, or small production deployments.

### Step 1: Launch EC2 Instance

```bash
# Create security group
aws ec2 create-security-group \
  --group-name sentrypulse-sg \
  --description "SentryPulse security group"

# Get security group ID
SG_ID=$(aws ec2 describe-security-groups \
  --group-names sentrypulse-sg \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Allow SSH (your IP only)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP_ADDRESS/32

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Launch instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name YOUR_KEY_PAIR_NAME \
  --security-group-ids $SG_ID \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=sentrypulse}]'
```

### Step 2: Connect and Setup

```bash
# Get instance public IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=sentrypulse" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# SSH into instance
ssh -i ~/.ssh/YOUR_KEY.pem ubuntu@$INSTANCE_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
ssh -i ~/.ssh/YOUR_KEY.pem ubuntu@$INSTANCE_IP
```

### Step 3: Deploy SentryPulse

```bash
# Clone repository
git clone https://github.com/your-org/sentrypulse.git
cd sentrypulse

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit configuration
nano backend/.env
# Update:
# - JWT_SECRET (generate with: openssl rand -base64 64)
# - DB_PASSWORD (strong password)
# - MAIL_* settings

nano frontend/.env.local
# Update:
# - NEXT_PUBLIC_API_URL=http://YOUR_DOMAIN/api

# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 64)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" backend/.env

# Start services
docker compose up -d

# Wait for MySQL
sleep 20

# Run migrations
docker compose exec backend npm run migrate

# Seed database
docker compose exec backend npm run seed

# Check status
docker compose ps
```

### Step 4: Configure Domain (Optional)

```bash
# If you have a domain, point it to your instance IP
# Update frontend/.env.local
nano frontend/.env.local
# Change: NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Restart frontend
docker compose restart frontend
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx container temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx configuration
sudo nano infrastructure/nginx.conf
# Add SSL configuration (see SSL section below)

# Restart nginx
docker compose up -d nginx
```

---

## Option 2: Production AWS Architecture

For high-availability and scalable production deployments.

### Components

1. **VPC** - Isolated network
2. **RDS MySQL** - Managed database
3. **ElastiCache Redis** - Managed cache
4. **ECS/Fargate** or **EC2 Auto Scaling** - Container orchestration
5. **ALB** - Load balancer
6. **CloudFront** - CDN
7. **S3** - Static assets and backups
8. **Route 53** - DNS
9. **ACM** - SSL certificates
10. **CloudWatch** - Monitoring

### Step 1: VPC Setup

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=sentrypulse-vpc}]'

VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=sentrypulse-vpc" \
  --query 'Vpcs[0].VpcId' \
  --output text)

# Create public subnets
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=sentrypulse-public-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=sentrypulse-public-1b}]'

# Create private subnets
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=sentrypulse-private-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=sentrypulse-private-1b}]'

# Create internet gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=sentrypulse-igw}]'

IGW_ID=$(aws ec2 describe-internet-gateways \
  --filters "Name=tag:Name,Values=sentrypulse-igw" \
  --query 'InternetGateways[0].InternetGatewayId' \
  --output text)

# Attach to VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID
```

### Step 2: RDS MySQL Setup

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name sentrypulse-db-subnet \
  --db-subnet-group-description "SentryPulse database subnets" \
  --subnet-ids subnet-xxx subnet-yyy

# Create security group for RDS
aws ec2 create-security-group \
  --group-name sentrypulse-rds-sg \
  --description "SentryPulse RDS security group" \
  --vpc-id $VPC_ID

RDS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=sentrypulse-rds-sg" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Allow MySQL from application security group
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 3306 \
  --source-group APP_SG_ID

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier sentrypulse-db \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name sentrypulse-db-subnet \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --multi-az \
  --publicly-accessible false \
  --storage-encrypted \
  --enable-performance-insights \
  --tags Key=Name,Value=sentrypulse-db

# Wait for RDS to be available (takes ~10 minutes)
aws rds wait db-instance-available --db-instance-identifier sentrypulse-db

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier sentrypulse-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### Step 3: ElastiCache Redis Setup

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name sentrypulse-redis-subnet \
  --cache-subnet-group-description "SentryPulse Redis subnets" \
  --subnet-ids subnet-xxx subnet-yyy

# Create security group for Redis
aws ec2 create-security-group \
  --group-name sentrypulse-redis-sg \
  --description "SentryPulse Redis security group" \
  --vpc-id $VPC_ID

REDIS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=sentrypulse-redis-sg" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Allow Redis from application
aws ec2 authorize-security-group-ingress \
  --group-id $REDIS_SG_ID \
  --protocol tcp \
  --port 6379 \
  --source-group APP_SG_ID

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id sentrypulse-redis \
  --replication-group-description "SentryPulse Redis cluster" \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.t3.medium \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --cache-subnet-group-name sentrypulse-redis-subnet \
  --security-group-ids $REDIS_SG_ID \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --tags Key=Name,Value=sentrypulse-redis

# Get Redis endpoint
REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
  --replication-group-id sentrypulse-redis \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
  --output text)

echo "Redis Endpoint: $REDIS_ENDPOINT"
```

### Step 4: ECS/Fargate Deployment

Create `ecs-task-definition.json`:

```json
{
  "family": "sentrypulse",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_REPO/sentrypulse-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "RDS_ENDPOINT"
        },
        {
          "name": "REDIS_HOST",
          "value": "REDIS_ENDPOINT"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:sentrypulse/db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:sentrypulse/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sentrypulse",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name sentrypulse

# Create ECS service
aws ecs create-service \
  --cluster sentrypulse \
  --service-name sentrypulse-backend \
  --task-definition sentrypulse \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000"
```

### Step 5: Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name sentrypulse-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name sentrypulse-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id $VPC_ID \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## SSL/TLS Configuration

### Using AWS Certificate Manager (Recommended)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS

# Follow email or DNS validation instructions
```

### Using Let's Encrypt (EC2 Deployment)

Update `infrastructure/nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rest of configuration...
}
```

---

## Monitoring & Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /sentrypulse/application

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name SentryPulse \
  --dashboard-body file://cloudwatch-dashboard.json

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name sentrypulse-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Application Monitoring

Add to `docker-compose.yml`:

```yaml
services:
  cloudwatch-agent:
    image: amazon/cloudwatch-agent:latest
    volumes:
      - ./cloudwatch-config.json:/opt/aws/amazon-cloudwatch-agent/etc/config.json:ro
    environment:
      - AWS_REGION=us-east-1
```

---

## Backups & Disaster Recovery

### Automated RDS Backups

```bash
# Already configured in RDS creation
# Backups retained for 7 days
# Point-in-time recovery enabled

# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier sentrypulse-db \
  --db-snapshot-identifier sentrypulse-manual-$(date +%Y%m%d)
```

### S3 Backup Strategy

```bash
# Create S3 bucket for backups
aws s3 mb s3://sentrypulse-backups-UNIQUE_ID

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sentrypulse-backups-UNIQUE_ID \
  --versioning-configuration Status=Enabled

# Set lifecycle policy
cat > lifecycle.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket sentrypulse-backups-UNIQUE_ID \
  --lifecycle-configuration file://lifecycle.json

# Backup script (add to cron)
cat > /usr/local/bin/backup-sentrypulse.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T mysql mysqldump -u sentrypulse -p$DB_PASSWORD sentrypulse | gzip > backup_$DATE.sql.gz
aws s3 cp backup_$DATE.sql.gz s3://sentrypulse-backups-UNIQUE_ID/
rm backup_$DATE.sql.gz
EOF

chmod +x /usr/local/bin/backup-sentrypulse.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-sentrypulse.sh" | crontab -
```

---

## Scaling Strategies

### Horizontal Scaling (ECS/Fargate)

```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster sentrypulse \
  --service sentrypulse-backend \
  --desired-count 4

# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/sentrypulse/sentrypulse-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/sentrypulse/sentrypulse-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Vertical Scaling (EC2)

```bash
# Stop instance
aws ec2 stop-instances --instance-ids i-xxxxx

# Wait for stopped
aws ec2 wait instance-stopped --instance-ids i-xxxxx

# Modify instance type
aws ec2 modify-instance-attribute \
  --instance-id i-xxxxx \
  --instance-type t3.large

# Start instance
aws ec2 start-instances --instance-ids i-xxxxx
```

### Database Scaling

```bash
# Modify RDS instance class
aws rds modify-db-instance \
  --db-instance-identifier sentrypulse-db \
  --db-instance-class db.t3.large \
  --apply-immediately

# Add read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier sentrypulse-db-replica \
  --source-db-instance-identifier sentrypulse-db \
  --db-instance-class db.t3.medium
```

---

## Cost Estimation

### Simple EC2 Deployment (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| EC2 t3.medium | 1 instance, on-demand | $30 |
| EBS gp3 | 30 GB | $2.40 |
| Data Transfer | 100 GB out | $9 |
| Route 53 | 1 hosted zone | $0.50 |
| **Total** | | **~$42/month** |

### Production Architecture (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| RDS MySQL | db.t3.medium, Multi-AZ | $125 |
| ElastiCache Redis | cache.t3.medium, 2 nodes | $100 |
| ECS Fargate | 2 tasks (1vCPU, 2GB each) | $60 |
| ALB | Standard | $23 |
| CloudFront | 100 GB transfer | $8.50 |
| S3 | 100 GB storage | $2.30 |
| Route 53 | 1 hosted zone | $0.50 |
| CloudWatch | Standard metrics | $10 |
| Data Transfer | 200 GB out | $18 |
| **Total** | | **~$347/month** |

### Cost Optimization Tips

1. **Use Reserved Instances** - Save 40-60% on EC2/RDS
2. **Use Spot Instances** - For non-critical workloads
3. **Right-size instances** - Monitor and adjust
4. **Enable S3 Lifecycle** - Move old data to Glacier
5. **Use CloudFront** - Reduce data transfer costs
6. **Schedule dev/test** - Stop instances when not needed

---

## Security Best Practices

### IAM Roles

```bash
# Create role for EC2
aws iam create-role \
  --role-name SentryPulseEC2Role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name SentryPulseEC2Role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

aws iam attach-role-policy \
  --role-name SentryPulseEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

### Secrets Management

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name sentrypulse/db-password \
  --secret-string "YOUR_STRONG_PASSWORD"

aws secretsmanager create-secret \
  --name sentrypulse/jwt-secret \
  --secret-string "$(openssl rand -base64 64)"

# Reference in application
export DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id sentrypulse/db-password \
  --query SecretString \
  --output text)
```

### Security Checklist

- ✅ Enable VPC Flow Logs
- ✅ Use Security Groups (not 0.0.0.0/0 for SSH)
- ✅ Enable encryption at rest (RDS, EBS, S3)
- ✅ Enable encryption in transit (SSL/TLS)
- ✅ Use AWS Secrets Manager
- ✅ Enable CloudTrail logging
- ✅ Enable GuardDuty
- ✅ Regular security patches
- ✅ Implement WAF rules
- ✅ Enable MFA for AWS account
- ✅ Use least-privilege IAM policies
- ✅ Regular security audits

---

## Troubleshooting

### Common Issues

**Service not accessible:**
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxx

# Check instance status
aws ec2 describe-instances --instance-ids i-xxx

# Check logs
aws logs tail /sentrypulse/application --follow
```

**Database connection issues:**
```bash
# Test from EC2
mysql -h $RDS_ENDPOINT -u admin -p

# Check RDS status
aws rds describe-db-instances --db-instance-identifier sentrypulse-db
```

**High costs:**
```bash
# Check Cost Explorer
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor CloudWatch dashboards
- Check application logs
- Review error rates

**Weekly:**
- Review security groups
- Check backup success
- Update dependencies

**Monthly:**
- Review costs
- Rotate credentials
- Test disaster recovery
- Update AMIs/containers
- Security patches

---

## Support

For AWS-specific questions:
- AWS Support Center
- AWS Forums
- AWS Documentation: https://docs.aws.amazon.com

For SentryPulse questions:
- GitHub Issues
- Email: support@sentrypulse.com

---

## Quick Reference

### Useful Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/key.pem ubuntu@INSTANCE_IP

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Database backup
docker compose exec mysql mysqldump -u sentrypulse -p sentrypulse > backup.sql

# Check service status
docker compose ps

# Update application
git pull
docker compose up -d --build

# Check AWS costs
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -d "+1 month" +%Y-%m-%d) \
  --metric BLENDED_COST \
  --granularity MONTHLY
```

---

**Your SentryPulse platform is ready for AWS!** 🚀

Choose the deployment option that fits your needs and budget. Start with the simple EC2 deployment and scale to the production architecture as your needs grow.
