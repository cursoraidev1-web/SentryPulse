<?php

namespace App\Core;

class Response
{
    public static function json($data, int $status = 200, array $headers = []): string
    {
        http_response_code($status);
        
        header('Content-Type: application/json');
        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }
        
        return json_encode($data);
    }

    public static function success($data = null, string $message = 'Success', int $status = 200): string
    {
        return static::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message, int $status = 400, $errors = null): string
    {
        return static::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    public static function created($data = null, string $message = 'Resource created'): string
    {
        return static::success($data, $message, 201);
    }

    public static function noContent(): void
    {
        http_response_code(204);
    }

    public static function unauthorized(string $message = 'Unauthorized'): string
    {
        return static::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden'): string
    {
        return static::error($message, 403);
    }

    public static function notFound(string $message = 'Resource not found'): string
    {
        return static::error($message, 404);
    }

    public static function validationError(array $errors, string $message = 'Validation failed'): string
    {
        return static::error($message, 422, $errors);
    }
}
