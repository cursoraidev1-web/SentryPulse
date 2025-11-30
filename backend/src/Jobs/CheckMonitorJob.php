<?php

namespace App\Jobs;

use App\Services\MonitoringService;
use App\Repositories\MonitorRepository;
use App\Repositories\IncidentRepository;

class CheckMonitorJob extends Job
{
    public function handle(): void
    {
        $monitorId = $this->data['monitor_id'];

        $monitorRepository = new MonitorRepository(db());
        $monitor = $monitorRepository->findById($monitorId);

        if (!$monitor || !$monitor->is_enabled) {
            return;
        }

        $monitoringService = new MonitoringService(
            $monitorRepository,
            new IncidentRepository(db())
        );

        $monitoringService->checkMonitor($monitor);
    }
}
