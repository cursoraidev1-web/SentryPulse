# SentryPulse API Documentation

Base URL: `http://localhost:8000/api`

All API requests must include proper headers:
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (for authenticated endpoints)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## Authentication

### Register

**POST** `/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login

**POST** `/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Get Current User

**GET** `/auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "timezone": "UTC"
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "John Smith",
  "timezone": "America/New_York"
}
```

## Teams

### List Teams

**GET** `/teams`

**Headers:** `Authorization: Bearer {token}`

### Create Team

**POST** `/teams`

**Request:**
```json
{
  "name": "My Team",
  "plan": "pro"
}
```

### Add Team Member

**POST** `/teams/{id}/members`

**Request:**
```json
{
  "user_id": 2,
  "role": "member"
}
```

Roles: `owner`, `admin`, `member`

## Monitors

### List Monitors

**GET** `/monitors?team_id={teamId}`

**Headers:** `Authorization: Bearer {token}`

### Get Monitor

**GET** `/monitors/{id}`

### Create Monitor

**POST** `/monitors`

**Request:**
```json
{
  "team_id": 1,
  "name": "Main Website",
  "url": "https://example.com",
  "type": "https",
  "method": "GET",
  "interval": 60,
  "timeout": 30,
  "check_ssl": true,
  "check_keyword": "Welcome",
  "expected_status_code": 200
}
```

**Parameters:**
- `team_id` (required): Team ID
- `name` (required): Monitor name
- `url` (required): URL to monitor
- `type` (optional): `http`, `https` (default: `https`)
- `method` (optional): `GET`, `POST`, `HEAD` (default: `GET`)
- `interval` (optional): Check interval in seconds (default: 60)
- `timeout` (optional): Request timeout in seconds (default: 30)
- `check_ssl` (optional): Check SSL certificate (default: true)
- `check_keyword` (optional): Keyword to find in response
- `expected_status_code` (optional): Expected HTTP status code (default: 200)

### Update Monitor

**PUT** `/monitors/{id}`

### Delete Monitor

**DELETE** `/monitors/{id}`

### Get Monitor Checks

**GET** `/monitors/{id}/checks?limit=100`

**Response:**
```json
{
  "success": true,
  "data": {
    "checks": [
      {
        "id": 1,
        "monitor_id": 1,
        "status": "success",
        "status_code": 200,
        "response_time": 145,
        "ssl_valid": true,
        "checked_at": "2025-11-30 10:30:00"
      }
    ]
  }
}
```

### Run Manual Check

**POST** `/monitors/{id}/check`

## Incidents

### List Incidents

**GET** `/incidents?team_id={teamId}&status={status}`

**Query Parameters:**
- `team_id` (required): Team ID
- `status` (optional): Filter by status (`investigating`, `identified`, `monitoring`, `resolved`)

### Get Incident

**GET** `/incidents/{id}`

### Update Incident

**PUT** `/incidents/{id}`

**Request:**
```json
{
  "status": "identified",
  "description": "Database connection timeout"
}
```

### Resolve Incident

**POST** `/incidents/{id}/resolve`

## Status Pages

### List Status Pages

**GET** `/status-pages?team_id={teamId}`

### Get Status Page

**GET** `/status-pages/{id}`

### Get Public Status Page

**GET** `/status/{slug}`

**Note:** This endpoint doesn't require authentication.

### Create Status Page

**POST** `/status-pages`

**Request:**
```json
{
  "team_id": 1,
  "name": "Public Status",
  "is_public": true
}
```

### Update Status Page

**PUT** `/status-pages/{id}`

### Add Monitor to Status Page

**POST** `/status-pages/{id}/monitors`

**Request:**
```json
{
  "monitor_id": 1,
  "display_order": 1
}
```

### Remove Monitor from Status Page

**DELETE** `/status-pages/{id}/monitors/{monitorId}`

## Analytics

### List Sites

**GET** `/analytics/sites?team_id={teamId}`

### Get Site

**GET** `/analytics/sites/{id}`

### Create Site

**POST** `/analytics/sites`

**Request:**
```json
{
  "team_id": 1,
  "name": "My Website",
  "domain": "example.com",
  "is_enabled": true,
  "public_stats": false
}
```

### Get Site Stats

**GET** `/analytics/sites/{id}/stats?start_date=2025-01-01&end_date=2025-01-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "pageviews": [
      {
        "date": "2025-01-01",
        "pageviews": 1523,
        "unique_visitors": 432,
        "sessions": 512
      }
    ],
    "top_pages": [
      {
        "url": "/",
        "views": 542,
        "unique_visitors": 234
      }
    ],
    "top_referrers": [
      {
        "referrer": "https://google.com",
        "visits": 123
      }
    ]
  }
}
```

### Collect Analytics Data

**POST** `/analytics/collect`

**Request:**
```json
{
  "tracking_code": "SP_XXXXXXXXXXXX",
  "url": "/products",
  "referrer": "https://google.com",
  "session_id": "sp_abc123...",
  "screen_width": 1920,
  "screen_height": 1080,
  "browser": "Chrome",
  "os": "Windows",
  "device_type": "desktop"
}
```

**For Custom Events:**
```json
{
  "tracking_code": "SP_XXXXXXXXXXXX",
  "event_name": "button_click",
  "properties": {
    "button_id": "cta-primary",
    "page": "homepage"
  },
  "url": "/",
  "session_id": "sp_abc123..."
}
```

## Webhook Payloads

### Incident Alert

```json
{
  "type": "alert",
  "monitor": {
    "id": 1,
    "name": "Main Website",
    "url": "https://example.com",
    "status": "down"
  },
  "incident": {
    "id": 1,
    "title": "Main Website is down",
    "description": "Connection timeout",
    "status": "investigating",
    "severity": "major",
    "started_at": "2025-11-30 10:30:00"
  },
  "timestamp": "2025-11-30 10:30:00"
}
```

### Incident Resolved

```json
{
  "type": "resolved",
  "monitor": {
    "id": 1,
    "name": "Main Website",
    "url": "https://example.com",
    "status": "up"
  },
  "incident": {
    "id": 1,
    "title": "Main Website is down",
    "status": "resolved",
    "started_at": "2025-11-30 10:30:00",
    "resolved_at": "2025-11-30 10:45:00",
    "duration_seconds": 900
  },
  "timestamp": "2025-11-30 10:45:00"
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 60 requests per minute per IP address.

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

## CORS

The API supports CORS for all origins. Include appropriate headers in your requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```
