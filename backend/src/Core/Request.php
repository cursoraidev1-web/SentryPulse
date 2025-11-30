<?php

namespace App\Core;

class Request
{
    protected array $query;
    protected array $request;
    protected array $server;
    protected array $headers;
    protected ?string $content;

    public function __construct()
    {
        $this->query = $_GET;
        $this->request = $_POST;
        $this->server = $_SERVER;
        $this->headers = $this->getAllHeaders();
        $this->content = file_get_contents('php://input');
    }

    protected function getAllHeaders(): array
    {
        $headers = [];
        
        foreach ($this->server as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
        
        return $headers;
    }

    public function input(string $key, $default = null)
    {
        $data = $this->all();
        return $data[$key] ?? $default;
    }

    public function all(): array
    {
        if ($this->isJson()) {
            return json_decode($this->content, true) ?? [];
        }
        
        return array_merge($this->query, $this->request);
    }

    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function header(string $key, $default = null)
    {
        $key = strtoupper(str_replace('-', '_', $key));
        return $this->headers[$key] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $header = $this->header('AUTHORIZATION');
        
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        
        return null;
    }

    public function isJson(): bool
    {
        return str_contains($this->header('CONTENT-TYPE', ''), 'application/json');
    }

    public function method(): string
    {
        return $this->server['REQUEST_METHOD'];
    }

    public function path(): string
    {
        $path = $this->server['REQUEST_URI'] ?? '/';
        return strtok($path, '?');
    }

    public function ip(): string
    {
        return $this->server['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public function userAgent(): string
    {
        return $this->server['HTTP_USER_AGENT'] ?? '';
    }
}
