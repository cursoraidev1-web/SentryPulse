# SentryPulse Architecture

## System Overview

SentryPulse is a comprehensive SaaS platform providing website monitoring, analytics, and incident management. The system is built with a modern microservices architecture using PHP/Laravel backend, Next.js frontend, and containerized deployment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Web Dashboard (Next.js)  │  Public Status Pages  │  Tracker │
└──────────────┬─────────────────────┬──────────────────┬──────┘
               │                     │                  │
               ▼                     ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                       Nginx (Reverse Proxy)                   │
└──────────────┬─────────────────────┬──────────────────────────┘
               │                     │
               ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  Frontend (3000) │  │  Backend API     │
    │     Next.js      │  │  (PHP-FPM 9000)  │
    └──────────────────┘  └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────┐  ┌──────────┐  ┌──────────────┐
            │   MySQL   │  │  Redis   │  │ Queue Worker │
            │  (3306)   │  │  (6379)  │  │   (Supervisor)│
            └───────────┘  └──────────┘  └──────────────┘
                                                │
                                                ▼
                                    ┌──────────────────────┐
                                    │   Cron Jobs          │
                                    │ - Monitor Checks     │
                                    │ - Analytics Aggregate│
                                    └──────────────────────┘
```

## Technology Stack

### Backend
- **Language:** PHP 8.2+
- **Framework:** Custom MVC (Laravel-inspired)
- **Database:** MySQL 8.0
- **Cache/Queue:** Redis 7
- **HTTP Client:** Guzzle
- **Authentication:** JWT (Firebase JWT)

### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Data Fetching:** SWR
- **Charts:** Recharts

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **Process Manager:** Supervisor
- **Task Scheduler:** Cron

## Database Schema (ERD)

```
┌─────────────┐
│   users     │
├─────────────┤
│ id          │◄────┐
│ name        │     │
│ email       │     │
│ password    │     │
└─────────────┘     │
                    │
┌─────────────┐     │         ┌──────────────┐
│   teams     │     │         │ team_users   │
├─────────────┤     └────────►├──────────────┤
│ id          │◄──────────────┤ team_id      │
│ name        │               │ user_id      │
│ owner_id    │               │ role         │
│ plan        │               └──────────────┘
└─────────────┘
      │
      │ ┌───────────────────┐
      ├►│    monitors       │
      │ ├───────────────────┤
      │ │ id                │
      │ │ team_id           │
      │ │ name              │
      │ │ url               │
      │ │ status            │
      │ │ uptime_percentage │
      │ └─────────┬─────────┘
      │           │
      │           ├─────►┌──────────────────┐
      │           │      │ monitor_checks   │
      │           │      ├──────────────────┤
      │           │      │ monitor_id       │
      │           │      │ status           │
      │           │      │ response_time    │
      │           │      │ checked_at       │
      │           │      └──────────────────┘
      │           │
      │           └─────►┌──────────────────┐
      │                  │   incidents      │
      │                  ├──────────────────┤
      │                  │ monitor_id       │
      │                  │ status           │
      │                  │ started_at       │
      │                  │ resolved_at      │
      │                  └──────────────────┘
      │
      ├►┌─────────────────┐
      │ │   sites         │
      │ ├─────────────────┤
      │ │ id              │
      │ │ team_id         │
      │ │ tracking_code   │
      │ └────────┬────────┘
      │          │
      │          ├─────►┌───────────────────┐
      │          │      │ pageviews_raw     │
      │          │      ├───────────────────┤
      │          │      │ site_id           │
      │          │      │ visitor_id        │
      │          │      │ url               │
      │          │      │ viewed_at         │
      │          │      └───────────────────┘
      │          │
      │          └─────►┌───────────────────┐
      │                 │ pageviews_daily   │
      │                 ├───────────────────┤
      │                 │ site_id           │
      │                 │ date              │
      │                 │ pageviews         │
      │                 │ unique_visitors   │
      │                 └───────────────────┘
      │
      └►┌─────────────────┐
        │  status_pages   │
        ├─────────────────┤
        │ id              │
        │ team_id         │
        │ slug            │
        │ is_public       │
        └─────────────────┘
```

## Core Components

### 1. Monitoring Engine

**Flow:**
```
Cron (every minute)
    ↓
MonitorRunCommand
    ↓
MonitoringService.runAllChecks()
    ↓
For each enabled monitor:
    ↓
    1. HTTP/HTTPS Check (Guzzle)
    2. SSL Certificate Validation
    3. DNS Resolution Check
    4. Keyword Search
    ↓
MonitorRepository.createCheck()
    ↓
IncidentService (if failure)
    ↓
NotificationService
    ↓
Multi-channel alerts (Email, Telegram, WhatsApp, Webhook)
```

**Key Classes:**
- `MonitoringService` - Core monitoring logic
- `MonitorRepository` - Database operations
- `IncidentService` - Incident management
- `NotificationService` - Alert dispatch

### 2. Incident Management

**Incident Lifecycle:**
```
Monitor Failure
    ↓
Create Incident (status: investigating)
    ↓
Send Alert Notifications
    ↓
Monitor Recovery
    ↓
Resolve Incident
    ↓
Send Resolution Notifications
```

**Incident Statuses:**
- `investigating` - Just detected
- `identified` - Cause identified
- `monitoring` - Fix deployed, monitoring
- `resolved` - Fully resolved

**Severity Levels:**
- `critical` - Complete service outage
- `major` - Significant functionality impaired
- `minor` - Minor issues

### 3. Analytics Pipeline

**Data Collection Flow:**
```
Website Visitor
    ↓
tracker.js (Client-side)
    ↓
POST /api/analytics/collect
    ↓
AnalyticsController.collect()
    ↓
AnalyticsService.recordPageview()
    ↓
Store in pageviews_raw table
    ↓
(Daily at 1 AM)
    ↓
AnalyticsAggregateCommand
    ↓
Aggregate to pageviews_daily
```

**Privacy Features:**
- No cookies
- IP addresses hashed server-side
- Session IDs stored in localStorage only
- No personal data collection
- GDPR compliant

### 4. Notification System

**Supported Channels:**

1. **Email**
   - SMTP configuration
   - HTML/plain text support

2. **Telegram**
   - Bot API integration
   - Markdown formatting

3. **WhatsApp**
   - Third-party API integration
   - Message templates

4. **Webhooks**
   - Custom HTTP endpoints
   - JSON payload
   - Retry mechanism

**Notification Flow:**
```
Incident Created/Resolved
    ↓
NotificationService.sendIncidentAlert()
    ↓
Query notification_channels for team
    ↓
For each enabled channel:
    ↓
    Create alerts_sent record (pending)
    ↓
    Try to send notification
    ↓
    Update status (sent/failed)
```

### 5. Queue System

**Queue Architecture:**
```
Redis List-based Queue
    ↓
QueueManager.push(job, data)
    ↓
Store job in Redis list
    ↓
QueueWorker (Supervisor)
    ↓
QueueManager.pop()
    ↓
Instantiate Job class
    ↓
Execute Job.handle()
    ↓
On failure: Retry (max 3 attempts)
    ↓
On final failure: Store in failed_jobs
```

**Job Types:**
- `CheckMonitorJob` - Run monitor check
- `SendAlertJob` - Send notification
- `AggregateAnalyticsJob` - Aggregate stats

## Security

### Authentication
- JWT-based authentication
- Token expiration (60 minutes default)
- Refresh token support
- Secure password hashing (bcrypt)

### Authorization
- Team-based access control
- Role-based permissions (owner, admin, member)
- Resource ownership validation

### Data Protection
- SQL injection prevention (prepared statements)
- XSS protection (output escaping)
- CSRF protection
- Rate limiting
- Input validation

## Scalability

### Horizontal Scaling
- **Backend:** Multiple PHP-FPM containers behind load balancer
- **Queue Workers:** Multiple worker containers
- **Database:** MySQL replication (read replicas)
- **Cache:** Redis Cluster

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Add indexes
- Implement caching

### Performance Optimizations
- Database query optimization
- Redis caching
- CDN for static assets
- Gzip compression
- HTTP/2 support

## Monitoring & Observability

### Logs
- Application logs: `/backend/storage/logs/`
- Nginx logs: `/var/log/nginx/`
- Supervisor logs: Process-specific logs

### Metrics
- Monitor check success/failure rates
- API response times
- Queue processing times
- Database query performance

### Health Checks
- Database connectivity
- Redis connectivity
- Disk space
- Memory usage

## Deployment

### Production Deployment
```bash
# 1. Clone repository
git clone <repository-url>
cd sentrypulse

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit configuration files

# 3. Build and deploy
chmod +x infrastructure/build.sh
chmod +x infrastructure/deploy.sh
./infrastructure/build.sh
./infrastructure/deploy.sh
```

### Continuous Deployment
- Git-based deployment
- Automated testing
- Blue-green deployment
- Rollback capability

## Backup & Recovery

### Database Backups
```bash
# Daily automated backup
docker compose exec mysql mysqldump -u sentrypulse -p sentrypulse > backup.sql

# Restore
docker compose exec -T mysql mysql -u sentrypulse -p sentrypulse < backup.sql
```

### Application Backups
- Configuration files
- Uploaded files (if any)
- SSL certificates

## Future Enhancements

1. **Multi-region Monitoring**
   - Check monitors from multiple geographic locations
   - Compare response times across regions

2. **Advanced Analytics**
   - Conversion tracking
   - Funnel analysis
   - A/B testing

3. **Integrations**
   - Slack notifications
   - PagerDuty integration
   - Datadog metrics export

4. **Advanced Monitoring**
   - Port monitoring
   - Certificate chain validation
   - Response body validation (JSON schema)

5. **API Rate Limiting**
   - Per-user rate limits
   - Configurable limits per plan

## Support

For issues and questions:
- Documentation: `/docs`
- Email: support@sentrypulse.com
- GitHub Issues: Repository issues page
