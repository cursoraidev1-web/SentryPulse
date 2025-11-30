<?php

namespace App\Models;

class Monitor
{
    public int $id;
    public int $team_id;
    public string $name;
    public string $url;
    public string $type;
    public string $method;
    public int $interval;
    public int $timeout;
    public string $status;
    public bool $is_enabled;
    public bool $check_ssl;
    public ?string $check_keyword;
    public int $expected_status_code;
    public ?array $headers;
    public ?string $body;
    public ?string $last_checked_at;
    public ?string $last_status;
    public ?int $last_response_time;
    public float $uptime_percentage;
    public string $created_at;
    public string $updated_at;

    public static function fromArray(array $data): self
    {
        $monitor = new self();
        foreach ($data as $key => $value) {
            if (property_exists($monitor, $key)) {
                if ($key === 'headers' && is_string($value)) {
                    $monitor->$key = json_decode($value, true);
                } elseif (in_array($key, ['is_enabled', 'check_ssl'])) {
                    $monitor->$key = (bool) $value;
                } else {
                    $monitor->$key = $value;
                }
            }
        }
        return $monitor;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'name' => $this->name,
            'url' => $this->url,
            'type' => $this->type,
            'method' => $this->method,
            'interval' => $this->interval,
            'timeout' => $this->timeout,
            'status' => $this->status,
            'is_enabled' => $this->is_enabled,
            'check_ssl' => $this->check_ssl,
            'check_keyword' => $this->check_keyword,
            'expected_status_code' => $this->expected_status_code,
            'headers' => $this->headers,
            'body' => $this->body,
            'last_checked_at' => $this->last_checked_at,
            'last_status' => $this->last_status,
            'last_response_time' => $this->last_response_time,
            'uptime_percentage' => $this->uptime_percentage,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
