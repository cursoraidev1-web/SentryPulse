<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Helpers/helpers.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$router = require __DIR__ . '/../routes/api.php';

$request = new \App\Core\Request();
$method = $request->method();
$path = $request->path();

$path = str_replace('/api', '', $path);

try {
    echo $router->dispatch($method, $path);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => config('app.debug') ? $e->getMessage() : null,
    ]);
}
