<?php

namespace App\Services;

use App\Models\Incident;
use App\Repositories\IncidentRepository;

class IncidentService
{
    protected IncidentRepository $incidentRepository;

    public function __construct(IncidentRepository $incidentRepository)
    {
        $this->incidentRepository = $incidentRepository;
    }

    public function getIncident(int $id): ?Incident
    {
        return $this->incidentRepository->findById($id);
    }

    public function getTeamIncidents(int $teamId, ?string $status = null, int $limit = 100): array
    {
        return $this->incidentRepository->findByTeam($teamId, $status, $limit);
    }

    public function getMonitorIncidents(int $monitorId, int $limit = 50): array
    {
        return $this->incidentRepository->findByMonitor($monitorId, $limit);
    }

    public function createIncident(array $data): Incident
    {
        return $this->incidentRepository->create($data);
    }

    public function updateIncident(int $id, array $data): Incident
    {
        $this->incidentRepository->update($id, $data);
        return $this->incidentRepository->findById($id);
    }

    public function resolveIncident(int $id): Incident
    {
        $this->incidentRepository->resolve($id);
        return $this->incidentRepository->findById($id);
    }

    public function deleteIncident(int $id): bool
    {
        return $this->incidentRepository->delete($id);
    }

    public function getActiveIncident(int $monitorId): ?Incident
    {
        return $this->incidentRepository->findActiveByMonitor($monitorId);
    }
}
