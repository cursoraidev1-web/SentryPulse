<?php

if (!function_exists('env')) {
    function env(string $key, $default = null)
    {
        $value = $_ENV[$key] ?? getenv($key);
        
        if ($value === false) {
            return $default;
        }
        
        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;
            case 'false':
            case '(false)':
                return false;
            case 'empty':
            case '(empty)':
                return '';
            case 'null':
            case '(null)':
                return null;
        }
        
        return $value;
    }
}

if (!function_exists('config')) {
    function config(string $key, $default = null)
    {
        static $config = [];
        
        if (empty($config)) {
            $configPath = __DIR__ . '/../../config';
            foreach (glob($configPath . '/*.php') as $file) {
                $name = basename($file, '.php');
                $config[$name] = require $file;
            }
        }
        
        $keys = explode('.', $key);
        $value = $config;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }
}

if (!function_exists('app')) {
    function app(?string $abstract = null)
    {
        $app = \App\Core\Application::getInstance();
        
        if (is_null($abstract)) {
            return $app;
        }
        
        return $app->make($abstract);
    }
}

if (!function_exists('db')) {
    function db(): \App\Core\Database
    {
        return app(\App\Core\Database::class);
    }
}

if (!function_exists('redis')) {
    function redis(): Predis\Client
    {
        static $redis = null;
        
        if (is_null($redis)) {
            $redis = new Predis\Client([
                'scheme' => 'tcp',
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port'),
                'password' => config('database.redis.default.password'),
            ]);
        }
        
        return $redis;
    }
}

if (!function_exists('bcrypt')) {
    function bcrypt(string $value): string
    {
        return password_hash($value, PASSWORD_BCRYPT, ['cost' => 10]);
    }
}

if (!function_exists('now')) {
    function now(): string
    {
        return date('Y-m-d H:i:s');
    }
}

if (!function_exists('uuid')) {
    function uuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}
