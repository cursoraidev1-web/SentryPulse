<?php

namespace App\Models;

class Team
{
    public int $id;
    public string $uuid;
    public string $name;
    public string $slug;
    public int $owner_id;
    public string $plan;
    public ?string $plan_expires_at;
    public ?array $settings;
    public string $created_at;
    public string $updated_at;

    public static function fromArray(array $data): self
    {
        $team = new self();
        foreach ($data as $key => $value) {
            if (property_exists($team, $key)) {
                if ($key === 'settings' && is_string($value)) {
                    $team->$key = json_decode($value, true);
                } else {
                    $team->$key = $value;
                }
            }
        }
        return $team;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'owner_id' => $this->owner_id,
            'plan' => $this->plan,
            'plan_expires_at' => $this->plan_expires_at,
            'settings' => $this->settings,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
