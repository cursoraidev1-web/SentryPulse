<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Incident;

class IncidentRepository
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?Incident
    {
        $data = $this->db->queryOne("SELECT * FROM incidents WHERE id = ?", [$id]);
        return $data ? Incident::fromArray($data) : null;
    }

    public function findByMonitor(int $monitorId, int $limit = 50): array
    {
        $data = $this->db->query(
            "SELECT * FROM incidents 
             WHERE monitor_id = ? 
             ORDER BY started_at DESC 
             LIMIT ?",
            [$monitorId, $limit]
        );

        return array_map(fn($item) => Incident::fromArray($item), $data);
    }

    public function findActiveByMonitor(int $monitorId): ?Incident
    {
        $data = $this->db->queryOne(
            "SELECT * FROM incidents 
             WHERE monitor_id = ? 
             AND status != 'resolved' 
             ORDER BY started_at DESC 
             LIMIT 1",
            [$monitorId]
        );

        return $data ? Incident::fromArray($data) : null;
    }

    public function findByTeam(int $teamId, ?string $status = null, int $limit = 100): array
    {
        $sql = "SELECT i.* FROM incidents i
                INNER JOIN monitors m ON i.monitor_id = m.id
                WHERE m.team_id = ?";
        $params = [$teamId];

        if ($status) {
            $sql .= " AND i.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY i.started_at DESC LIMIT ?";
        $params[] = $limit;

        $data = $this->db->query($sql, $params);
        return array_map(fn($item) => Incident::fromArray($item), $data);
    }

    public function create(array $attributes): Incident
    {
        $id = $this->db->insert(
            "INSERT INTO incidents (
                monitor_id, title, description, status, severity,
                started_at, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $attributes['monitor_id'],
                $attributes['title'],
                $attributes['description'] ?? null,
                $attributes['status'] ?? 'investigating',
                $attributes['severity'] ?? 'major',
                $attributes['started_at'] ?? now(),
                isset($attributes['metadata']) ? json_encode($attributes['metadata']) : null,
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

        $allowedFields = ['title', 'description', 'status', 'severity'];

        foreach ($attributes as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "{$key} = ?";
                $params[] = $value;
            } elseif ($key === 'metadata') {
                $fields[] = "metadata = ?";
                $params[] = json_encode($value);
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = ?";
        $params[] = now();
        $params[] = $id;

        $sql = "UPDATE incidents SET " . implode(', ', $fields) . " WHERE id = ?";
        return $this->db->execute($sql, $params);
    }

    public function resolve(int $id): bool
    {
        $incident = $this->findById($id);
        if (!$incident) {
            return false;
        }

        $startedAt = strtotime($incident->started_at);
        $resolvedAt = time();
        $duration = $resolvedAt - $startedAt;

        return $this->db->execute(
            "UPDATE incidents SET 
                status = 'resolved',
                resolved_at = ?,
                duration_seconds = ?,
                updated_at = ?
             WHERE id = ?",
            [now(), $duration, now(), $id]
        );
    }

    public function delete(int $id): bool
    {
        return $this->db->execute("DELETE FROM incidents WHERE id = ?", [$id]);
    }
}
