<?php

namespace App\Models;

class Site
{
    public int $id;
    public int $team_id;
    public string $name;
    public string $domain;
    public string $tracking_code;
    public bool $is_enabled;
    public string $timezone;
    public bool $public_stats;
    public ?array $settings;
    public string $created_at;
    public string $updated_at;

    public static function fromArray(array $data): self
    {
        $site = new self();
        foreach ($data as $key => $value) {
            if (property_exists($site, $key)) {
                if ($key === 'settings' && is_string($value)) {
                    $site->$key = json_decode($value, true);
                } elseif (in_array($key, ['is_enabled', 'public_stats'])) {
                    $site->$key = (bool) $value;
                } else {
                    $site->$key = $value;
                }
            }
        }
        return $site;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'name' => $this->name,
            'domain' => $this->domain,
            'tracking_code' => $this->tracking_code,
            'is_enabled' => $this->is_enabled,
            'timezone' => $this->timezone,
            'public_stats' => $this->public_stats,
            'settings' => $this->settings,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
