<?php

namespace App\Core;

use Dotenv\Dotenv;

class Application
{
    protected string $basePath;
    protected Container $container;
    protected static ?Application $instance = null;

    public function __construct(string $basePath)
    {
        $this->basePath = $basePath;
        $this->container = new Container();
        static::$instance = $this;
        
        $this->loadEnvironment();
        $this->registerBaseBindings();
    }

    protected function loadEnvironment(): void
    {
        if (file_exists($this->basePath . '/.env')) {
            $dotenv = Dotenv::createImmutable($this->basePath);
            $dotenv->load();
        }
    }

    protected function registerBaseBindings(): void
    {
        $this->container->singleton(Application::class, fn() => $this);
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->container->singleton($abstract, $concrete);
    }

    public function make(string $abstract)
    {
        return $this->container->make($abstract);
    }

    public function basePath(string $path = ''): string
    {
        return $this->basePath . ($path ? DIRECTORY_SEPARATOR . $path : '');
    }

    public static function getInstance(): ?Application
    {
        return static::$instance;
    }
}
