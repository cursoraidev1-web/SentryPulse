<?php

namespace App\Jobs;

use App\Services\NotificationService;
use App\Repositories\IncidentRepository;

class SendAlertJob extends Job
{
    public function handle(): void
    {
        $incidentId = $this->data['incident_id'];
        $type = $this->data['type'] ?? 'alert';

        $incidentRepository = new IncidentRepository(db());
        $incident = $incidentRepository->findById($incidentId);

        if (!$incident) {
            return;
        }

        $notificationService = new NotificationService(db());

        if ($type === 'resolved') {
            $notificationService->sendIncidentResolved($incident);
        } else {
            $notificationService->sendIncidentAlert($incident);
        }
    }
}
