<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AnalyticsService;
use App\Repositories\SiteRepository;

class AnalyticsController
{
    protected AnalyticsService $analyticsService;
    protected SiteRepository $siteRepository;

    public function __construct()
    {
        $this->siteRepository = new SiteRepository(db());
        $this->analyticsService = new AnalyticsService(db(), $this->siteRepository);
    }

    public function sites(): string
    {
        $request = new Request();
        $teamId = $request->query('team_id');

        if (!$teamId) {
            return Response::validationError(['team_id' => 'Team ID is required']);
        }

        $sites = $this->siteRepository->findByTeam((int) $teamId);

        return Response::success([
            'sites' => array_map(fn($s) => $s->toArray(), $sites)
        ]);
    }

    public function showSite(string $id): string
    {
        $site = $this->siteRepository->findById((int) $id);

        if (!$site) {
            return Response::notFound('Site not found');
        }

        return Response::success(['site' => $site->toArray()]);
    }

    public function createSite(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['team_id']) || empty($data['name']) || empty($data['domain'])) {
            return Response::validationError([
                'team_id' => 'Team ID is required',
                'name' => 'Site name is required',
                'domain' => 'Domain is required',
            ]);
        }

        try {
            $site = $this->siteRepository->create($data);
            return Response::created(['site' => $site->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function updateSite(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        $site = $this->siteRepository->findById((int) $id);

        if (!$site) {
            return Response::notFound('Site not found');
        }

        try {
            $this->siteRepository->update((int) $id, $data);
            $updatedSite = $this->siteRepository->findById((int) $id);
            return Response::success(['site' => $updatedSite->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function deleteSite(string $id): string
    {
        $site = $this->siteRepository->findById((int) $id);

        if (!$site) {
            return Response::notFound('Site not found');
        }

        try {
            $this->siteRepository->delete((int) $id);
            return Response::success(null, 'Site deleted successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function stats(string $id): string
    {
        $request = new Request();
        $startDate = $request->query('start_date', date('Y-m-d', strtotime('-30 days')));
        $endDate = $request->query('end_date', date('Y-m-d'));

        $site = $this->siteRepository->findById((int) $id);

        if (!$site) {
            return Response::notFound('Site not found');
        }

        $pageviews = $this->analyticsService->getPageviewStats((int) $id, $startDate, $endDate);
        $topPages = $this->analyticsService->getTopPages((int) $id, $startDate, $endDate);
        $topReferrers = $this->analyticsService->getTopReferrers((int) $id, $startDate, $endDate);

        return Response::success([
            'pageviews' => $pageviews,
            'top_pages' => $topPages,
            'top_referrers' => $topReferrers,
        ]);
    }

    public function collect(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['tracking_code'])) {
            return Response::validationError(['tracking_code' => 'Tracking code is required']);
        }

        $data['ip'] = $request->ip();
        $data['user_agent'] = $request->userAgent();

        try {
            if (isset($data['event_name'])) {
                $this->analyticsService->recordEvent($data['tracking_code'], $data);
            } else {
                $this->analyticsService->recordPageview($data['tracking_code'], $data);
            }

            return Response::success(null, 'Recorded');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }
}
