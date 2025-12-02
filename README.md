# SentryPulse

A comprehensive SaaS platform for website monitoring, analytics, and incident management.

**Backend**: Node.js + TypeScript + Express  
**Frontend**: Next.js 14 + React + TypeScript  
**Database**: MySQL 8 + Redis

## Features

- **Uptime Monitoring**: HTTP/HTTPS health checks with SSL and DNS validation
- **Incident Management**: Automatic incident creation, tracking, and resolution
- **Multi-Channel Alerts**: Email, WhatsApp, Telegram, and webhook notifications
- **Public Status Pages**: Branded status pages for your services
- **Privacy-Focused Analytics**: GDPR-compliant website analytics and event tracking
- **Team Collaboration**: Multi-user teams with role-based access control
- **Usage-Based Billing**: Flexible plans with usage tracking and limits

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Ports 80, 3000, 3306, 6379, 8000 available

### Installation (3 steps!)

```bash
# 1. Start everything
docker compose up --build -d

# 2. Wait for MySQL (about 10 seconds)
sleep 10

# 3. Initialize database
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

### Access

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Tracker**: http://localhost/tracker.js

**Default Login**: admin@sentrypulse.com / password

## Technology Stack

### Backend (Node.js + TypeScript)
- Express.js web framework
- MySQL 8 with connection pooling
- Redis for caching and queues
- JWT authentication
- TypeScript for type safety
- Winston for logging

### Frontend (Next.js + TypeScript)
- Next.js 14 with App Router
- React 18
- TailwindCSS for styling
- SWR for data fetching
- Dark mode support

### Infrastructure
- Docker & Docker Compose
- Nginx reverse proxy
- Automated health checks
- Hot reload in development

## Project Structure

```
sentrypulse/
├── backend/          # Node.js/TypeScript backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # API controllers
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Database layer
│   │   └── routes/       # API routes
│   └── package.json
├── frontend/         # Next.js frontend
│   ├── app/          # Pages
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── package.json
├── tracking/         # Analytics scripts
├── infrastructure/   # Docker configs
└── docs/            # Documentation
```

## Common Commands

```bash
# Using Make (easiest)
make build      # Build Docker images
make start      # Start services
make migrate    # Run database migrations
make seed       # Seed with demo data
make logs       # View logs
make stop       # Stop services

# Using Docker Compose
docker compose up -d              # Start
docker compose logs -f            # Logs
docker compose exec backend sh   # Backend shell
docker compose down              # Stop
```

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev          # Hot reload with tsx watch
npm run build        # Build TypeScript
npm run migrate      # Run migrations
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Build for production
```

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/monitors` - List monitors
- `POST /api/monitors` - Create monitor
- `POST /api/monitors/:id/check` - Run manual check
- `GET /api/health` - Health check

See [docs/api.md](docs/api.md) for complete API documentation.

## Configuration

### Backend (.env)

```env
NODE_ENV=production
PORT=8000
DB_HOST=mysql
DB_NAME=sentrypulse
DB_USER=sentrypulse
DB_PASSWORD=secret
REDIS_HOST=redis
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=SentryPulse
```

## Documentation

- [Quick Start](QUICKSTART.md) - Get started in 5 minutes
- [Setup Guide](SETUP.md) - Detailed setup instructions
- [AWS Deployment](AWS_DEPLOYMENT.md) - Deploy to AWS (EC2, RDS, ECS)
- [API Documentation](docs/api.md) - Complete API reference
- [Architecture](docs/architecture.md) - System architecture
- [Node.js Migration](NODEJS_MIGRATION.md) - Backend migration notes

## Features Checklist

✅ Website uptime monitoring (HTTP/HTTPS/DNS/SSL)  
✅ Automated incident creation and resolution  
✅ Multi-channel alerting (Email, Telegram, WhatsApp, Webhook)  
✅ Public status pages  
✅ Privacy-focused analytics with event tracking  
✅ Team collaboration with role-based access  
✅ JWT authentication  
✅ TypeScript for type safety  
✅ Docker deployment  
✅ Health checks  
✅ Database migrations  
✅ Comprehensive logging  

## Troubleshooting

### Services won't start

```bash
docker compose down
docker compose up -d
docker compose logs
```

### Database issues

```bash
# Check MySQL is ready
docker compose exec mysql mysqladmin ping

# Re-run migrations
docker compose exec backend npm run migrate
```

### Backend errors

```bash
# Check logs
docker compose logs backend

# Restart backend
docker compose restart backend

# Access shell
docker compose exec backend sh
```

## Production Deployment

### Deploy to AWS

We have a complete AWS deployment guide with two options:

**Option 1: Simple EC2 (~$40/month)**
- Single EC2 instance
- Docker Compose
- Perfect for small/medium teams
- 30-minute setup

**Option 2: Production Architecture (~$350/month)**
- ECS/Fargate
- RDS Multi-AZ
- ElastiCache Redis
- Auto-scaling
- High availability

📖 **Full Guide:** [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

### Other Options

- **DigitalOcean/Linode VPS**: $12-50/month
- **Heroku**: $50-150/month (zero DevOps)
- **Google Cloud**: ~$60/month
- **Self-hosted**: Your own server

📖 **Compare All Options:** [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)

## License

Proprietary - SootheTech © 2025

## Support

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@sentrypulse.com

---

**Ready to go!** Run `docker compose up --build` and visit http://localhost:3000 🚀
