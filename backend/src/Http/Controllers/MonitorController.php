<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\MonitoringService;
use App\Repositories\MonitorRepository;
use App\Repositories\IncidentRepository;

class MonitorController
{
    protected MonitorRepository $monitorRepository;
    protected MonitoringService $monitoringService;

    public function __construct()
    {
        $this->monitorRepository = new MonitorRepository(db());
        $this->monitoringService = new MonitoringService(
            $this->monitorRepository,
            new IncidentRepository(db())
        );
    }

    public function index(): string
    {
        $request = new Request();
        $teamId = $request->query('team_id');

        if (!$teamId) {
            return Response::validationError(['team_id' => 'Team ID is required']);
        }

        $monitors = $this->monitorRepository->findByTeam($teamId);

        return Response::success([
            'monitors' => array_map(fn($m) => $m->toArray(), $monitors)
        ]);
    }

    public function show(string $id): string
    {
        $monitor = $this->monitorRepository->findById((int) $id);

        if (!$monitor) {
            return Response::notFound('Monitor not found');
        }

        return Response::success(['monitor' => $monitor->toArray()]);
    }

    public function store(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['team_id']) || empty($data['name']) || empty($data['url'])) {
            return Response::validationError([
                'team_id' => 'Team ID is required',
                'name' => 'Name is required',
                'url' => 'URL is required',
            ]);
        }

        if (!filter_var($data['url'], FILTER_VALIDATE_URL)) {
            return Response::validationError(['url' => 'Invalid URL format']);
        }

        try {
            $monitor = $this->monitorRepository->create($data);
            return Response::created(['monitor' => $monitor->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function update(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        $monitor = $this->monitorRepository->findById((int) $id);

        if (!$monitor) {
            return Response::notFound('Monitor not found');
        }

        if (isset($data['url']) && !filter_var($data['url'], FILTER_VALIDATE_URL)) {
            return Response::validationError(['url' => 'Invalid URL format']);
        }

        try {
            $this->monitorRepository->update((int) $id, $data);
            $updatedMonitor = $this->monitorRepository->findById((int) $id);
            return Response::success(['monitor' => $updatedMonitor->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function destroy(string $id): string
    {
        $monitor = $this->monitorRepository->findById((int) $id);

        if (!$monitor) {
            return Response::notFound('Monitor not found');
        }

        try {
            $this->monitorRepository->delete((int) $id);
            return Response::success(null, 'Monitor deleted successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function checks(string $id): string
    {
        $monitor = $this->monitorRepository->findById((int) $id);

        if (!$monitor) {
            return Response::notFound('Monitor not found');
        }

        $request = new Request();
        $limit = (int) ($request->query('limit') ?? 100);

        $checks = $this->monitorRepository->getChecks((int) $id, $limit);

        return Response::success(['checks' => $checks]);
    }

    public function runCheck(string $id): string
    {
        $monitor = $this->monitorRepository->findById((int) $id);

        if (!$monitor) {
            return Response::notFound('Monitor not found');
        }

        try {
            $result = $this->monitoringService->checkMonitor($monitor);
            return Response::success(['result' => $result]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 500);
        }
    }
}
