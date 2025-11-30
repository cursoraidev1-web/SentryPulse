<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Team;

class TeamRepository
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?Team
    {
        $data = $this->db->queryOne("SELECT * FROM teams WHERE id = ?", [$id]);
        return $data ? Team::fromArray($data) : null;
    }

    public function findByUuid(string $uuid): ?Team
    {
        $data = $this->db->queryOne("SELECT * FROM teams WHERE uuid = ?", [$uuid]);
        return $data ? Team::fromArray($data) : null;
    }

    public function findBySlug(string $slug): ?Team
    {
        $data = $this->db->queryOne("SELECT * FROM teams WHERE slug = ?", [$slug]);
        return $data ? Team::fromArray($data) : null;
    }

    public function findByUser(int $userId): array
    {
        $data = $this->db->query(
            "SELECT t.* FROM teams t
             INNER JOIN team_users tu ON t.id = tu.team_id
             WHERE tu.user_id = ?
             ORDER BY t.created_at DESC",
            [$userId]
        );

        return array_map(fn($item) => Team::fromArray($item), $data);
    }

    public function create(array $attributes): Team
    {
        $uuid = uuid();
        $id = $this->db->insert(
            "INSERT INTO teams (uuid, name, slug, owner_id, plan, settings, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $uuid,
                $attributes['name'],
                $attributes['slug'],
                $attributes['owner_id'],
                $attributes['plan'] ?? 'free',
                isset($attributes['settings']) ? json_encode($attributes['settings']) : null,
                now(),
                now(),
            ]
        );

        $this->db->execute(
            "INSERT INTO team_users (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)",
            [$id, $attributes['owner_id'], 'owner', now()]
        );

        return $this->findById($id);
    }

    public function update(int $id, array $attributes): bool
    {
        $fields = [];
        $params = [];

        foreach ($attributes as $key => $value) {
            if (in_array($key, ['name', 'slug', 'plan', 'plan_expires_at'])) {
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

        $sql = "UPDATE teams SET " . implode(', ', $fields) . " WHERE id = ?";
        return $this->db->execute($sql, $params);
    }

    public function addMember(int $teamId, int $userId, string $role = 'member', ?int $invitedBy = null): bool
    {
        return $this->db->execute(
            "INSERT INTO team_users (team_id, user_id, role, invited_by, joined_at) VALUES (?, ?, ?, ?, ?)",
            [$teamId, $userId, $role, $invitedBy, now()]
        );
    }

    public function removeMember(int $teamId, int $userId): bool
    {
        return $this->db->execute(
            "DELETE FROM team_users WHERE team_id = ? AND user_id = ?",
            [$teamId, $userId]
        );
    }

    public function updateMemberRole(int $teamId, int $userId, string $role): bool
    {
        return $this->db->execute(
            "UPDATE team_users SET role = ? WHERE team_id = ? AND user_id = ?",
            [$role, $teamId, $userId]
        );
    }

    public function isMember(int $teamId, int $userId): bool
    {
        $result = $this->db->queryOne(
            "SELECT id FROM team_users WHERE team_id = ? AND user_id = ?",
            [$teamId, $userId]
        );

        return $result !== null;
    }

    public function getMemberRole(int $teamId, int $userId): ?string
    {
        $result = $this->db->queryOne(
            "SELECT role FROM team_users WHERE team_id = ? AND user_id = ?",
            [$teamId, $userId]
        );

        return $result['role'] ?? null;
    }

    public function delete(int $id): bool
    {
        return $this->db->execute("DELETE FROM teams WHERE id = ?", [$id]);
    }
}
