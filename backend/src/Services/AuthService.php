<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register(array $data): array
    {
        $existingUser = $this->userRepository->findByEmail($data['email']);
        if ($existingUser) {
            throw new \Exception('Email already registered');
        }

        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'timezone' => $data['timezone'] ?? 'UTC',
        ]);

        $token = $this->generateToken($user);

        return [
            'user' => $user->toArray(),
            'token' => $token,
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !password_verify($password, $user->password)) {
            throw new \Exception('Invalid credentials');
        }

        $this->userRepository->updateLastLogin($user->id);

        $token = $this->generateToken($user);

        return [
            'user' => $user->toArray(),
            'token' => $token,
        ];
    }

    public function validateToken(string $token): ?User
    {
        try {
            $decoded = JWT::decode(
                $token,
                new Key(config('jwt.secret'), config('jwt.algo'))
            );

            return $this->userRepository->findById($decoded->sub);
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function generateToken(User $user): string
    {
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'iat' => time(),
            'exp' => time() + (config('jwt.ttl') * 60),
            'nbf' => time(),
            'jti' => uuid(),
        ];

        return JWT::encode($payload, config('jwt.secret'), config('jwt.algo'));
    }

    public function refreshToken(string $token): string
    {
        $user = $this->validateToken($token);

        if (!$user) {
            throw new \Exception('Invalid token');
        }

        return $this->generateToken($user);
    }

    public function getUser(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function updateProfile(int $userId, array $data): User
    {
        $this->userRepository->update($userId, $data);
        return $this->userRepository->findById($userId);
    }
}
