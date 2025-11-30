<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\TeamRepository;
use App\Services\AuthService;

class TeamController
{
    protected TeamRepository $teamRepository;

    public function __construct()
    {
        $this->teamRepository = new TeamRepository(db());
    }

    public function index(): string
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return Response::unauthorized();
        }

        $authService = new AuthService(new \App\Repositories\UserRepository(db()));
        $user = $authService->validateToken($token);

        if (!$user) {
            return Response::unauthorized();
        }

        $teams = $this->teamRepository->findByUser($user->id);

        return Response::success([
            'teams' => array_map(fn($t) => $t->toArray(), $teams)
        ]);
    }

    public function show(string $id): string
    {
        $team = $this->teamRepository->findById((int) $id);

        if (!$team) {
            return Response::notFound('Team not found');
        }

        return Response::success(['team' => $team->toArray()]);
    }

    public function store(): string
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return Response::unauthorized();
        }

        $authService = new AuthService(new \App\Repositories\UserRepository(db()));
        $user = $authService->validateToken($token);

        if (!$user) {
            return Response::unauthorized();
        }

        $data = $request->all();

        if (empty($data['name'])) {
            return Response::validationError(['name' => 'Team name is required']);
        }

        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $data['name']));
        $slug = trim($slug, '-');

        if ($this->teamRepository->findBySlug($slug)) {
            $slug .= '-' . substr(uniqid(), -5);
        }

        try {
            $team = $this->teamRepository->create([
                'name' => $data['name'],
                'slug' => $slug,
                'owner_id' => $user->id,
                'plan' => $data['plan'] ?? 'free',
            ]);

            return Response::created(['team' => $team->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function update(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        $team = $this->teamRepository->findById((int) $id);

        if (!$team) {
            return Response::notFound('Team not found');
        }

        try {
            $this->teamRepository->update((int) $id, $data);
            $updatedTeam = $this->teamRepository->findById((int) $id);
            return Response::success(['team' => $updatedTeam->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function addMember(string $id): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['user_id'])) {
            return Response::validationError(['user_id' => 'User ID is required']);
        }

        $team = $this->teamRepository->findById((int) $id);

        if (!$team) {
            return Response::notFound('Team not found');
        }

        try {
            $this->teamRepository->addMember(
                (int) $id,
                (int) $data['user_id'],
                $data['role'] ?? 'member',
                $data['invited_by'] ?? null
            );

            return Response::success(null, 'Member added successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function removeMember(string $id, string $userId): string
    {
        $team = $this->teamRepository->findById((int) $id);

        if (!$team) {
            return Response::notFound('Team not found');
        }

        try {
            $this->teamRepository->removeMember((int) $id, (int) $userId);
            return Response::success(null, 'Member removed successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }
}
