<?php

return [
    'name' => env('APP_NAME', 'SentryPulse'),
    'env' => env('APP_ENV', 'production'),
    'debug' => env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => 'en',
    
    'key' => env('APP_KEY'),
    
    'cipher' => 'AES-256-CBC',
    
    'providers' => [
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
    ],
];
