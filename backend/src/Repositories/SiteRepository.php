<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Site;

class SiteRepository
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?Site
    {
        $data = $this->db->queryOne("SELECT * FROM sites WHERE id = ?", [$id]);
        return $data ? Site::fromArray($data) : null;
    }

    public function findByTrackingCode(string $trackingCode): ?Site
    {
        $data = $this->db->queryOne(
            "SELECT * FROM sites WHERE tracking_code = ?",
            [$trackingCode]
        );
        return $data ? Site::fromArray($data) : null;
    }

    public function findByTeam(int $teamId): array
    {
        $data = $this->db->query(
            "SELECT * FROM sites WHERE team_id = ? ORDER BY created_at DESC",
            [$teamId]
        );

        return array_map(fn($item) => Site::fromArray($item), $data);
    }

    public function create(array $attributes): Site
    {
        $trackingCode = 'SP_' . strtoupper(substr(md5(uniqid()), 0, 12));

        $id = $this->db->insert(
            "INSERT INTO sites (
                team_id, name, domain, tracking_code, is_enabled,
                timezone, public_stats, settings, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $attributes['team_id'],
                $attributes['name'],
                $attributes['domain'],
                $trackingCode,
                $attributes['is_enabled'] ?? true,
                $attributes['timezone'] ?? 'UTC',
                $attributes['public_stats'] ?? false,
                isset($attributes['settings']) ? json_encode($attributes['settings']) : null,
                now(),
                now(),
            ]
        );

        return $this->findById($id);
    }

    public function update(int $id, array $attributes): bool
    {
        $fields = [];
        $params = [];

        $allowedFields = ['name', 'domain', 'is_enabled', 'timezone', 'public_stats'];

        foreach ($attributes as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "{$key} = ?";
                $params[] = $value;
            } elseif ($key === 'settings') {
                $fields[] = "settings = ?";
                $params[] = json_encode($value);
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = ?";
        $params[] = now();
        $params[] = $id;

        $sql = "UPDATE sites SET " . implode(', ', $fields) . " WHERE id = ?";
        return $this->db->execute($sql, $params);
    }

    public function delete(int $id): bool
    {
        return $this->db->execute("DELETE FROM sites WHERE id = ?", [$id]);
    }

    public function recordPageview(int $siteId, array $data): int
    {
        return $this->db->insert(
            "INSERT INTO pageviews_raw (
                site_id, visitor_id, session_id, url, referrer,
                utm_source, utm_medium, utm_campaign,
                browser, os, device_type, country_code,
                screen_width, screen_height, viewed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $siteId,
                $data['visitor_id'],
                $data['session_id'],
                $data['url'],
                $data['referrer'] ?? null,
                $data['utm_source'] ?? null,
                $data['utm_medium'] ?? null,
                $data['utm_campaign'] ?? null,
                $data['browser'] ?? null,
                $data['os'] ?? null,
                $data['device_type'] ?? null,
                $data['country_code'] ?? null,
                $data['screen_width'] ?? null,
                $data['screen_height'] ?? null,
                $data['viewed_at'] ?? now(),
            ]
        );
    }

    public function recordEvent(int $siteId, array $data): int
    {
        return $this->db->insert(
            "INSERT INTO events_raw (
                site_id, visitor_id, session_id, event_name,
                properties, url, occurred_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                $siteId,
                $data['visitor_id'],
                $data['session_id'],
                $data['event_name'],
                isset($data['properties']) ? json_encode($data['properties']) : null,
                $data['url'] ?? null,
                $data['occurred_at'] ?? now(),
            ]
        );
    }
}
