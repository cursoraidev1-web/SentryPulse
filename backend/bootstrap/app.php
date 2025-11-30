<?php

use App\Core\Application;
use App\Core\Container;

$app = new Application(
    dirname(__DIR__)
);

$app->singleton(
    App\Core\Container::class,
    fn() => new Container()
);

$app->singleton(
    App\Core\Router::class,
    fn() => new App\Core\Router()
);

$app->singleton(
    App\Core\Database::class,
    function () {
        return new App\Core\Database(
            env('DB_HOST'),
            env('DB_DATABASE'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            env('DB_PORT', 3306)
        );
    }
);

return $app;
