<?php

namespace App\Jobs;

use App\Services\AnalyticsService;
use App\Repositories\SiteRepository;

class AggregateAnalyticsJob extends Job
{
    public function handle(): void
    {
        $date = $this->data['date'] ?? date('Y-m-d', strtotime('-1 day'));

        $analyticsService = new AnalyticsService(
            db(),
            new SiteRepository(db())
        );

        $analyticsService->aggregateDailyStats($date);
    }
}
