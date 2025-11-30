<?php

namespace App\Services;

use App\Core\Database;
use App\Repositories\SiteRepository;

class AnalyticsService
{
    protected Database $db;
    protected SiteRepository $siteRepository;

    public function __construct(Database $db, SiteRepository $siteRepository)
    {
        $this->db = $db;
        $this->siteRepository = $siteRepository;
    }

    public function recordPageview(string $trackingCode, array $data): bool
    {
        $site = $this->siteRepository->findByTrackingCode($trackingCode);

        if (!$site || !$site->is_enabled) {
            return false;
        }

        $visitorId = $this->hashVisitorId($data['ip'], $data['user_agent']);
        $sessionId = $data['session_id'] ?? $this->generateSessionId($visitorId);

        $this->siteRepository->recordPageview($site->id, [
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'url' => $data['url'],
            'referrer' => $data['referrer'] ?? null,
            'utm_source' => $data['utm_source'] ?? null,
            'utm_medium' => $data['utm_medium'] ?? null,
            'utm_campaign' => $data['utm_campaign'] ?? null,
            'browser' => $data['browser'] ?? null,
            'os' => $data['os'] ?? null,
            'device_type' => $data['device_type'] ?? null,
            'country_code' => $data['country_code'] ?? null,
            'screen_width' => $data['screen_width'] ?? null,
            'screen_height' => $data['screen_height'] ?? null,
            'viewed_at' => now(),
        ]);

        return true;
    }

    public function recordEvent(string $trackingCode, array $data): bool
    {
        $site = $this->siteRepository->findByTrackingCode($trackingCode);

        if (!$site || !$site->is_enabled) {
            return false;
        }

        $visitorId = $this->hashVisitorId($data['ip'], $data['user_agent']);
        $sessionId = $data['session_id'] ?? $this->generateSessionId($visitorId);

        $this->siteRepository->recordEvent($site->id, [
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'event_name' => $data['event_name'],
            'properties' => $data['properties'] ?? null,
            'url' => $data['url'] ?? null,
            'occurred_at' => now(),
        ]);

        return true;
    }

    public function aggregateDailyStats(string $date): void
    {
        $sites = $this->db->query("SELECT id FROM sites WHERE is_enabled = TRUE");

        foreach ($sites as $site) {
            $this->aggregateSiteStats($site['id'], $date);
        }
    }

    protected function aggregateSiteStats(int $siteId, string $date): void
    {
        $stats = $this->db->queryOne(
            "SELECT 
                COUNT(*) as pageviews,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(DISTINCT session_id) as sessions
             FROM pageviews_raw
             WHERE site_id = ? 
             AND DATE(viewed_at) = ?",
            [$siteId, $date]
        );

        $this->db->execute(
            "INSERT INTO pageviews_daily 
                (site_id, date, pageviews, unique_visitors, sessions)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                pageviews = VALUES(pageviews),
                unique_visitors = VALUES(unique_visitors),
                sessions = VALUES(sessions)",
            [
                $siteId,
                $date,
                $stats['pageviews'],
                $stats['unique_visitors'],
                $stats['sessions'],
            ]
        );

        $events = $this->db->query(
            "SELECT 
                event_name,
                COUNT(*) as count,
                COUNT(DISTINCT visitor_id) as unique_users
             FROM events_raw
             WHERE site_id = ? 
             AND DATE(occurred_at) = ?
             GROUP BY event_name",
            [$siteId, $date]
        );

        foreach ($events as $event) {
            $this->db->execute(
                "INSERT INTO events_daily 
                    (site_id, event_name, date, count, unique_users)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    count = VALUES(count),
                    unique_users = VALUES(unique_users)",
                [
                    $siteId,
                    $event['event_name'],
                    $date,
                    $event['count'],
                    $event['unique_users'],
                ]
            );
        }
    }

    public function getPageviewStats(int $siteId, string $startDate, string $endDate): array
    {
        return $this->db->query(
            "SELECT * FROM pageviews_daily 
             WHERE site_id = ? 
             AND date BETWEEN ? AND ?
             ORDER BY date ASC",
            [$siteId, $startDate, $endDate]
        );
    }

    public function getEventStats(int $siteId, string $eventName, string $startDate, string $endDate): array
    {
        return $this->db->query(
            "SELECT * FROM events_daily 
             WHERE site_id = ? 
             AND event_name = ?
             AND date BETWEEN ? AND ?
             ORDER BY date ASC",
            [$siteId, $eventName, $startDate, $endDate]
        );
    }

    public function getTopPages(int $siteId, string $startDate, string $endDate, int $limit = 10): array
    {
        return $this->db->query(
            "SELECT 
                url,
                COUNT(*) as views,
                COUNT(DISTINCT visitor_id) as unique_visitors
             FROM pageviews_raw
             WHERE site_id = ?
             AND DATE(viewed_at) BETWEEN ? AND ?
             GROUP BY url
             ORDER BY views DESC
             LIMIT ?",
            [$siteId, $startDate, $endDate, $limit]
        );
    }

    public function getTopReferrers(int $siteId, string $startDate, string $endDate, int $limit = 10): array
    {
        return $this->db->query(
            "SELECT 
                referrer,
                COUNT(*) as visits
             FROM pageviews_raw
             WHERE site_id = ?
             AND DATE(viewed_at) BETWEEN ? AND ?
             AND referrer IS NOT NULL
             AND referrer != ''
             GROUP BY referrer
             ORDER BY visits DESC
             LIMIT ?",
            [$siteId, $startDate, $endDate, $limit]
        );
    }

    protected function hashVisitorId(string $ip, string $userAgent): string
    {
        return hash('sha256', $ip . $userAgent . date('Y-m-d'));
    }

    protected function generateSessionId(string $visitorId): string
    {
        return hash('sha256', $visitorId . time());
    }
}
