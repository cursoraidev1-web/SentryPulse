# SentryPulse

A comprehensive SaaS platform for website monitoring, analytics, and incident management.

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
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sentrypulse
```

2. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Update environment variables in `backend/.env` and `frontend/.env.local`

4. Build and start services:
```bash
docker compose up --build
```

5. Run migrations:
```bash
docker compose exec backend php artisan migrate --seed
```

### Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs

### Default Credentials

- Email: admin@sentrypulse.com
- Password: password

## Project Structure

```
sentrypulse/
├── backend/          # Laravel PHP backend
├── frontend/         # Next.js React frontend
├── tracking/         # Analytics tracking scripts
├── infrastructure/   # Docker, nginx, supervisor configs
└── docs/            # Documentation
```

## Development

### Backend Development

```bash
cd backend
composer install
php artisan serve
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend tests
docker compose exec frontend npm test
```

## Documentation

- [API Documentation](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)

## License

Proprietary - SootheTech © 2025
