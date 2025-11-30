<?php

namespace App\Core;

class Router
{
    protected array $routes = [];
    protected array $middlewares = [];
    protected string $prefix = '';
    protected array $groupMiddlewares = [];

    public function get(string $uri, $action): void
    {
        $this->addRoute('GET', $uri, $action);
    }

    public function post(string $uri, $action): void
    {
        $this->addRoute('POST', $uri, $action);
    }

    public function put(string $uri, $action): void
    {
        $this->addRoute('PUT', $uri, $action);
    }

    public function patch(string $uri, $action): void
    {
        $this->addRoute('PATCH', $uri, $action);
    }

    public function delete(string $uri, $action): void
    {
        $this->addRoute('DELETE', $uri, $action);
    }

    public function group(array $attributes, callable $callback): void
    {
        $previousPrefix = $this->prefix;
        $previousMiddlewares = $this->groupMiddlewares;

        if (isset($attributes['prefix'])) {
            $this->prefix .= '/' . trim($attributes['prefix'], '/');
        }

        if (isset($attributes['middleware'])) {
            $this->groupMiddlewares = array_merge(
                $this->groupMiddlewares,
                is_array($attributes['middleware']) ? $attributes['middleware'] : [$attributes['middleware']]
            );
        }

        $callback($this);

        $this->prefix = $previousPrefix;
        $this->groupMiddlewares = $previousMiddlewares;
    }

    protected function addRoute(string $method, string $uri, $action): void
    {
        $uri = $this->prefix . '/' . trim($uri, '/');
        $uri = '/' . trim($uri, '/');

        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'action' => $action,
            'middlewares' => $this->groupMiddlewares,
        ];
    }

    public function dispatch(string $method, string $uri): mixed
    {
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchUri($route['uri'], $uri, $params)) {
                return $this->callAction($route['action'], $params, $route['middlewares']);
            }
        }

        http_response_code(404);
        return json_encode(['error' => 'Route not found']);
    }

    protected function matchUri(string $routeUri, string $requestUri, &$params = []): bool
    {
        $params = [];
        $routePattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $routeUri);
        $routePattern = '#^' . $routePattern . '$#';

        if (preg_match($routePattern, $requestUri, $matches)) {
            array_shift($matches);
            preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $routeUri, $paramNames);
            
            foreach ($paramNames[1] as $index => $name) {
                $params[$name] = $matches[$index] ?? null;
            }
            
            return true;
        }

        return false;
    }

    protected function callAction($action, array $params, array $middlewares): mixed
    {
        if (is_string($action)) {
            [$controller, $method] = explode('@', $action);
            $controller = "App\\Http\\Controllers\\{$controller}";
            $instance = new $controller();
            
            return $instance->$method(...array_values($params));
        }

        if (is_callable($action)) {
            return $action(...array_values($params));
        }

        throw new \Exception("Invalid route action");
    }

    public function getRoutes(): array
    {
        return $this->routes;
    }
}
