#!/bin/bash

# Monitor Checks - Run every minute
# Add to crontab: * * * * * /path/to/backend/cron/monitor-checks.sh

cd "$(dirname "$0")/.."
php artisan monitor:run >> storage/logs/monitor-checks.log 2>&1
