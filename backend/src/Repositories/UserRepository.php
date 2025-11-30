<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\User;

class UserRepository
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?User
    {
        $data = $this->db->queryOne("SELECT * FROM users WHERE id = ?", [$id]);
        return $data ? User::fromArray($data) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $data = $this->db->queryOne("SELECT * FROM users WHERE email = ?", [$email]);
        return $data ? User::fromArray($data) : null;
    }

    public function create(array $attributes): User
    {
        $id = $this->db->insert(
            "INSERT INTO users (name, email, password, timezone, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?)",
            [
                $attributes['name'],
                $attributes['email'],
                $attributes['password'],
                $attributes['timezone'] ?? 'UTC',
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

        foreach ($attributes as $key => $value) {
            if (in_array($key, ['name', 'email', 'avatar', 'timezone'])) {
                $fields[] = "{$key} = ?";
                $params[] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = ?";
        $params[] = now();
        $params[] = $id;

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        return $this->db->execute($sql, $params);
    }

    public function updateLastLogin(int $id): bool
    {
        return $this->db->execute(
            "UPDATE users SET last_login_at = ? WHERE id = ?",
            [now(), $id]
        );
    }

    public function delete(int $id): bool
    {
        return $this->db->execute("DELETE FROM users WHERE id = ?", [$id]);
    }
}
