<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;

class AuthController
{
    protected AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService(
            new \App\Repositories\UserRepository(db())
        );
    }

    public function register(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return Response::validationError([
                'name' => 'Name is required',
                'email' => 'Email is required',
                'password' => 'Password is required',
            ]);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return Response::validationError(['email' => 'Invalid email format']);
        }

        if (strlen($data['password']) < 8) {
            return Response::validationError(['password' => 'Password must be at least 8 characters']);
        }

        try {
            $result = $this->authService->register($data);
            return Response::created($result, 'Registration successful');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function login(): string
    {
        $request = new Request();
        $data = $request->all();

        if (empty($data['email']) || empty($data['password'])) {
            return Response::validationError([
                'email' => 'Email is required',
                'password' => 'Password is required',
            ]);
        }

        try {
            $result = $this->authService->login($data['email'], $data['password']);
            return Response::success($result, 'Login successful');
        } catch (\Exception $e) {
            return Response::unauthorized($e->getMessage());
        }
    }

    public function me(): string
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return Response::unauthorized();
        }

        $user = $this->authService->validateToken($token);

        if (!$user) {
            return Response::unauthorized('Invalid token');
        }

        return Response::success(['user' => $user->toArray()]);
    }

    public function refresh(): string
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return Response::unauthorized();
        }

        try {
            $newToken = $this->authService->refreshToken($token);
            return Response::success(['token' => $newToken]);
        } catch (\Exception $e) {
            return Response::unauthorized($e->getMessage());
        }
    }

    public function updateProfile(): string
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return Response::unauthorized();
        }

        $user = $this->authService->validateToken($token);

        if (!$user) {
            return Response::unauthorized('Invalid token');
        }

        $data = $request->all();
        $allowedFields = ['name', 'avatar', 'timezone'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        try {
            $updatedUser = $this->authService->updateProfile($user->id, $updateData);
            return Response::success(['user' => $updatedUser->toArray()]);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }
}
