<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Monitor;

class MonitorRepository
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?Monitor
    {
        $data = $this->db->queryOne("SELECT * FROM monitors WHERE id = ?", [$id]);
        return $data ? Monitor::fromArray($data) : null;
    }

    public function findByTeam(int $teamId): array
    {
        $data = $this->db->query(
            "SELECT * FROM monitors WHERE team_id = ? ORDER BY created_at DESC",
            [$teamId]
        );

        return array_map(fn($item) => Monitor::fromArray($item), $data);
    }

    public function findEnabled(): array
    {
        $data = $this->db->query(
            "SELECT * FROM monitors WHERE is_enabled = TRUE ORDER BY last_checked_at ASC NULLS FIRST"
        );

        return array_map(fn($item) => Monitor::fromArray($item), $data);
    }

    public function create(array $attributes): Monitor
    {
        $id = $this->db->insert(
            "INSERT INTO monitors (
                team_id, name, url, type, method, interval, timeout,
                is_enabled, check_ssl, check_keyword, expected_status_code,
                headers, body, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $attributes['team_id'],
                $attributes['name'],
                $attributes['url'],
                $attributes['type'] ?? 'https',
                $attributes['method'] ?? 'GET',
                $attributes['interval'] ?? 60,
                $attributes['timeout'] ?? 30,
                $attributes['is_enabled'] ?? true,
                $attributes['check_ssl'] ?? true,
                $attributes['check_keyword'] ?? null,
                $attributes['expected_status_code'] ?? 200,
                isset($attributes['headers']) ? json_encode($attributes['headers']) : null,
                $attributes['body'] ?? null,
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

        $allowedFields = [
            'name', 'url', 'type', 'method', 'interval', 'timeout',
            'is_enabled', 'check_ssl', 'check_keyword', 'expected_status_code', 'body'
        ];

        foreach ($attributes as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "{$key} = ?";
                $params[] = $value;
            } elseif ($key === 'headers') {
                $fields[] = "headers = ?";
                $params[] = json_encode($value);
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = ?";
        $params[] = now();
        $params[] = $id;

        $sql = "UPDATE monitors SET " . implode(', ', $fields) . " WHERE id = ?";
        return $this->db->execute($sql, $params);
    }

    public function updateCheckResult(int $id, array $data): bool
    {
        return $this->db->execute(
            "UPDATE monitors SET 
                last_checked_at = ?,
                last_status = ?,
                last_response_time = ?,
                status = ?
             WHERE id = ?",
            [
                now(),
                $data['status'],
                $data['response_time'] ?? null,
                $data['monitor_status'],
                $id,
            ]
        );
    }

    public function updateUptimePercentage(int $id): bool
    {
        $result = $this->db->queryOne(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes
             FROM monitor_checks 
             WHERE monitor_id = ? 
             AND checked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
            [$id]
        );

        if ($result['total'] > 0) {
            $percentage = ($result['successes'] / $result['total']) * 100;
            return $this->db->execute(
                "UPDATE monitors SET uptime_percentage = ? WHERE id = ?",
                [round($percentage, 2), $id]
            );
        }

        return true;
    }

    public function delete(int $id): bool
    {
        return $this->db->execute("DELETE FROM monitors WHERE id = ?", [$id]);
    }

    public function getChecks(int $monitorId, int $limit = 100): array
    {
        return $this->db->query(
            "SELECT * FROM monitor_checks 
             WHERE monitor_id = ? 
             ORDER BY checked_at DESC 
             LIMIT ?",
            [$monitorId, $limit]
        );
    }

    public function createCheck(int $monitorId, array $data): int
    {
        return $this->db->insert(
            "INSERT INTO monitor_checks (
                monitor_id, status, status_code, response_time,
                error_message, ssl_valid, ssl_expires_at,
                dns_resolved, keyword_found, checked_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $monitorId,
                $data['status'],
                $data['status_code'] ?? null,
                $data['response_time'] ?? null,
                $data['error_message'] ?? null,
                $data['ssl_valid'] ?? null,
                $data['ssl_expires_at'] ?? null,
                $data['dns_resolved'] ?? null,
                $data['keyword_found'] ?? null,
                now(),
            ]
        );
    }
}
