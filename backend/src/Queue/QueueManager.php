<?php

namespace App\Queue;

use Predis\Client;

class QueueManager
{
    protected Client $redis;
    protected string $queueName;

    public function __construct(string $queueName = 'default')
    {
        $this->redis = redis();
        $this->queueName = $queueName;
    }

    public function push(string $jobClass, array $data = []): void
    {
        $job = [
            'class' => $jobClass,
            'data' => $data,
            'id' => uuid(),
            'attempts' => 0,
            'created_at' => time(),
        ];

        $this->redis->rpush("queue:{$this->queueName}", [json_encode($job)]);
    }

    public function pop(): ?array
    {
        $result = $this->redis->blpop(["queue:{$this->queueName}"], 5);

        if (!$result) {
            return null;
        }

        return json_decode($result[1], true);
    }

    public function failed(array $job, string $exception): void
    {
        db()->insert(
            "INSERT INTO failed_jobs (connection, queue, payload, exception, failed_at) VALUES (?, ?, ?, ?, ?)",
            [
                'redis',
                $this->queueName,
                json_encode($job),
                $exception,
                now(),
            ]
        );
    }

    public function size(): int
    {
        return (int) $this->redis->llen("queue:{$this->queueName}");
    }
}
