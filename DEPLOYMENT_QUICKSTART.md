# SentryPulse Deployment - Quick Start

**Choose your deployment in 2 minutes!**

## 🏆 Best Choice for Most Users: AWS Lambda

**Why Lambda?**
- 💰 **Cheapest**: $5-15/month for typical use (vs $40+ for servers)
- 🚀 **Auto-scales**: From 0 to millions automatically
- 🛠️ **Zero maintenance**: No servers to manage
- 📊 **Pay per use**: Only pay when users visit

### Quick Setup (45 minutes)

```bash
# 1. Install Serverless Framework
npm install -g serverless

# 2. Deploy backend
cd backend
npm install serverless-http
serverless deploy --stage prod

# 3. Deploy frontend to S3
cd ../frontend
npm run build
aws s3 sync out/ s3://your-bucket/

# Done! ✅
```

**Full Guide:** [AWS_LAMBDA_DEPLOYMENT.md](AWS_LAMBDA_DEPLOYMENT.md)

---

## Other Options

### Traditional Server (DigitalOcean VPS)
**When:** You prefer traditional servers or need consistent resources
**Cost:** $12/month
**Setup:** 15 minutes

```bash
# Create $12/mo droplet
# SSH in
ssh root@YOUR_IP

# Deploy with Docker
git clone YOUR_REPO
cd sentrypulse
docker compose up -d
```

### AWS EC2 (Simple)
**When:** Need AWS ecosystem, have consistent traffic
**Cost:** $40/month
**Setup:** 30 minutes

Good middle ground between Lambda and VPS.

**Guide:** [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

### Heroku (Zero DevOps)
**When:** Need it running NOW, zero DevOps experience
**Cost:** $50/month
**Setup:** 10 minutes

```bash
heroku create sentrypulse
heroku addons:create heroku-postgresql
git push heroku main
```

---

## Cost Comparison (Monthly)

### Lambda (Recommended) ⭐
| Users/Day | Cost |
|-----------|------|
| 1,000 | $5-15 |
| 10,000 | $30-50 |
| 100,000 | $200-300 |

**Key:** Scales automatically, pay only for use!

### Traditional Servers
| Option | Fixed Cost |
|--------|------------|
| DigitalOcean VPS | $12 |
| AWS EC2 Simple | $40 |
| AWS Production | $350+ |
| Heroku | $50-100 |

**Key:** Same cost regardless of traffic (good if always busy)

---

## When NOT to Use Lambda

❌ **Don't use Lambda if:**
- You need WebSocket connections (use EC2)
- Processes run > 15 minutes (use EC2)
- You have consistent high traffic 24/7 (EC2 might be cheaper)
- You prefer traditional server management

✅ **Lambda is perfect if:**
- Variable/unpredictable traffic ⭐
- Budget-conscious
- Want zero server management
- Need automatic scaling
- Starting small but might grow fast

---

## Quick Decision

```
Do you have CONSISTENT high traffic 24/7?
│
├─ No → Use Lambda ($5-50/mo) ⭐
│
└─ Yes → How many requests/month?
    │
    ├─ < 1M → DigitalOcean VPS ($12/mo)
    │
    └─ > 1M → AWS EC2 or Production ($40-350/mo)
```

---

## Setup Time Comparison

| Option | Setup | Ongoing |
|--------|-------|---------|
| Lambda | 45 min | 0 min/week |
| VPS | 15 min | 30 min/week |
| AWS EC2 | 30 min | 1 hr/week |
| AWS Prod | 4 hours | 2 hr/week |
| Heroku | 10 min | 0 min/week |

---

## Migration is Easy!

Start with Lambda, then:
- **Traffic grows but irregular?** → Stay on Lambda! It scales.
- **Constant high traffic?** → Migrate to EC2 (same codebase)
- **Need HA?** → Migrate to AWS Production

**No lock-in!** The codebase works on any platform.

---

## Get Started Now

### Option 1: Lambda (Recommended)
```bash
cd backend
serverless deploy --stage prod
# Full guide: AWS_LAMBDA_DEPLOYMENT.md
```

### Option 2: VPS (Simple)
```bash
# Get $12/mo DigitalOcean Droplet
docker compose up -d
# Full guide: DEPLOYMENT_OPTIONS.md
```

### Option 3: Quick MVP (Heroku)
```bash
heroku create sentrypulse
git push heroku main
# Full guide: DEPLOYMENT_OPTIONS.md
```

---

## Support

- **Lambda Guide**: [AWS_LAMBDA_DEPLOYMENT.md](AWS_LAMBDA_DEPLOYMENT.md)
- **All Options**: [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)
- **AWS Traditional**: [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

**Need help?** Open an issue on GitHub!

---

**Bottom Line:** Use **AWS Lambda** unless you have a specific reason not to. It's the cheapest, easiest to maintain, and scales automatically! 🚀
