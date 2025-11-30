<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\IncidentService;
use App\Repositories\IncidentRepository;

class IncidentController
{
    protected IncidentService $incidentService;

    public function __construct()
    {
        $this->incidentService = new IncidentService(
            new IncidentRepository(db())
        );
    }

    public function index(): string
    {
        $request = new Request();
        $teamId = $request->query('team_id');
        $status = $request->query('status');
        $limit = (int) ($request->query('limit') ?? 100);

        if (!$teamId) {
            return Response::validationError(['team_id' => 'Team ID is required']);
        }

        $incidents = $this->incidentService->getTeamIncidents((int) $teamId, $status, $limit);

        return Response::success([
            'incidents' => array_map(fn($i) => $i->toArray(), $incidents)
        ]);
    }

    public function show(string $id): string
    {
        $incident = $this->incidentService->getIncident((int) $id);

        if (!$incident) {
            return Response::notFound('Incident not found');
        }

        return Response::success(['incident' => $incident->toArray()]);
    }

    public function update(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        $incident = $this->incidentService->getIncident((int) $id);

        if (!$incident) {
            return Response::notFound('Incident not found');
        }

        try {
            $updatedIncident = $this->incidentService->updateIncident((int) $id, $data);
            return Response::success(['incident' => $updatedIncident->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function resolve(string $id): string
    {
        $incident = $this->incidentService->getIncident((int) $id);

        if (!$incident) {
            return Response::notFound('Incident not found');
        }

        try {
            $resolvedIncident = $this->incidentService->resolveIncident((int) $id);
            return Response::success(['incident' => $resolvedIncident->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function monitorIncidents(string $monitorId): string
    {
        $request = new Request();
        $limit = (int) ($request->query('limit') ?? 50);

        $incidents = $this->incidentService->getMonitorIncidents((int) $monitorId, $limit);

        return Response::success([
            'incidents' => array_map(fn($i) => $i->toArray(), $incidents)
        ]);
    }
}
