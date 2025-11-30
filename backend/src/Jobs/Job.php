<?php

namespace App\Jobs;

abstract class Job
{
    protected array $data;
    protected int $maxAttempts = 3;

    public function __construct(array $data = [])
    {
        $this->data = $data;
    }

    abstract public function handle(): void;

    public function getData(): array
    {
        return $this->data;
    }

    public function getMaxAttempts(): int
    {
        return $this->maxAttempts;
    }
}
