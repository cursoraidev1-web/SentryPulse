<?php

namespace App\Models;

class Incident
{
    public int $id;
    public int $monitor_id;
    public string $title;
    public ?string $description;
    public string $status;
    public string $severity;
    public string $started_at;
    public ?string $resolved_at;
    public ?int $duration_seconds;
    public ?array $metadata;
    public string $created_at;
    public string $updated_at;

    public static function fromArray(array $data): self
    {
        $incident = new self();
        foreach ($data as $key => $value) {
            if (property_exists($incident, $key)) {
                if ($key === 'metadata' && is_string($value)) {
                    $incident->$key = json_decode($value, true);
                } else {
                    $incident->$key = $value;
                }
            }
        }
        return $incident;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'monitor_id' => $this->monitor_id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'severity' => $this->severity,
            'started_at' => $this->started_at,
            'resolved_at' => $this->resolved_at,
            'duration_seconds' => $this->duration_seconds,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
