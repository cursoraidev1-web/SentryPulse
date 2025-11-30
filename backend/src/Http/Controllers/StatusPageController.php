<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;

class StatusPageController
{
    public function index(): string
    {
        $request = new Request();
        $teamId = $request->query('team_id');

        if (!$teamId) {
            return Response::validationError(['team_id' => 'Team ID is required']);
        }

        $statusPages = db()->query(
            "SELECT * FROM status_pages WHERE team_id = ? ORDER BY created_at DESC",
            [(int) $teamId]
        );

        return Response::success(['status_pages' => $statusPages]);
    }

    public function show(string $id): string
    {
        $statusPage = db()->queryOne("SELECT * FROM status_pages WHERE id = ?", [(int) $id]);

        if (!$statusPage) {
            return Response::notFound('Status page not found');
        }

        $monitors = db()->query(
            "SELECT m.*, spm.display_order 
             FROM monitors m
             INNER JOIN status_page_monitors spm ON m.id = spm.monitor_id
             WHERE spm.status_page_id = ?
             ORDER BY spm.display_order ASC",
            [(int) $id]
        );

        $statusPage['monitors'] = $monitors;

        return Response::success(['status_page' => $statusPage]);
    }

    public function showBySlug(string $slug): string
    {
        $statusPage = db()->queryOne("SELECT * FROM status_pages WHERE slug = ?", [$slug]);

        if (!$statusPage || !$statusPage['is_public']) {
            return Response::notFound('Status page not found');
        }

        $monitors = db()->query(
            "SELECT m.*, spm.display_order 
             FROM monitors m
             INNER JOIN status_page_monitors spm ON m.id = spm.monitor_id
             WHERE spm.status_page_id = ?
             ORDER BY spm.display_order ASC",
            [(int) $statusPage['id']]
        );

        $statusPage['monitors'] = $monitors;

        return Response::success(['status_page' => $statusPage]);
    }

    public function store(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['team_id']) || empty($data['name'])) {
            return Response::validationError([
                'team_id' => 'Team ID is required',
                'name' => 'Name is required',
            ]);
        }

        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $data['name']));
        $slug = trim($slug, '-');

        $existing = db()->queryOne("SELECT id FROM status_pages WHERE slug = ?", [$slug]);
        if ($existing) {
            $slug .= '-' . substr(uniqid(), -5);
        }

        try {
            $id = db()->insert(
                "INSERT INTO status_pages (team_id, name, slug, is_public, theme, custom_css, custom_html) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    (int) $data['team_id'],
                    $data['name'],
                    $slug,
                    $data['is_public'] ?? true,
                    isset($data['theme']) ? json_encode($data['theme']) : null,
                    $data['custom_css'] ?? null,
                    $data['custom_html'] ?? null,
                ]
            );

            $statusPage = db()->queryOne("SELECT * FROM status_pages WHERE id = ?", [$id]);

            return Response::created(['status_page' => $statusPage]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function update(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        $statusPage = db()->queryOne("SELECT * FROM status_pages WHERE id = ?", [(int) $id]);

        if (!$statusPage) {
            return Response::notFound('Status page not found');
        }

        $fields = [];
        $params = [];

        $allowedFields = ['name', 'is_public', 'logo_url', 'domain', 'custom_css', 'custom_html'];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "{$key} = ?";
                $params[] = $value;
            } elseif ($key === 'theme') {
                $fields[] = "theme = ?";
                $params[] = json_encode($value);
            }
        }

        if (empty($fields)) {
            return Response::validationError(['data' => 'No valid fields to update']);
        }

        $params[] = (int) $id;

        try {
            db()->execute(
                "UPDATE status_pages SET " . implode(', ', $fields) . " WHERE id = ?",
                $params
            );

            $updatedStatusPage = db()->queryOne("SELECT * FROM status_pages WHERE id = ?", [(int) $id]);

            return Response::success(['status_page' => $updatedStatusPage]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function destroy(string $id): string
    {
        $statusPage = db()->queryOne("SELECT * FROM status_pages WHERE id = ?", [(int) $id]);

        if (!$statusPage) {
            return Response::notFound('Status page not found');
        }

        try {
            db()->execute("DELETE FROM status_pages WHERE id = ?", [(int) $id]);
            return Response::success(null, 'Status page deleted successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function addMonitor(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['monitor_id'])) {
            return Response::validationError(['monitor_id' => 'Monitor ID is required']);
        }

        try {
            db()->insert(
                "INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)",
                [(int) $id, (int) $data['monitor_id'], (int) ($data['display_order'] ?? 0)]
            );

            return Response::success(null, 'Monitor added to status page');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function removeMonitor(string $id, string $monitorId): string
    {
        try {
            db()->execute(
                "DELETE FROM status_page_monitors WHERE status_page_id = ? AND monitor_id = ?",
                [(int) $id, (int) $monitorId]
            );

            return Response::success(null, 'Monitor removed from status page');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }
}
