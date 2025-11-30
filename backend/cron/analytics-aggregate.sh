#!/bin/bash

# Analytics Aggregation - Run daily at 1 AM
# Add to crontab: 0 1 * * * /path/to/backend/cron/analytics-aggregate.sh

cd "$(dirname "$0")/.."
php artisan analytics:aggregate >> storage/logs/analytics-aggregate.log 2>&1
