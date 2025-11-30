<?php

namespace App\Services;

use App\Core\Database;
use App\Models\Incident;
use App\Models\Monitor;
use GuzzleHttp\Client;

class NotificationService
{
    protected Database $db;
    protected Client $httpClient;

    public function __construct(Database $db)
    {
        $this->db = $db;
        $this->httpClient = new Client(['timeout' => 10]);
    }

    public function sendIncidentAlert(Incident $incident): void
    {
        $monitor = $this->getMonitor($incident->monitor_id);
        if (!$monitor) {
            return;
        }

        $channels = $this->getTeamNotificationChannels($monitor['team_id']);

        foreach ($channels as $channel) {
            if (!$channel['is_enabled']) {
                continue;
            }

            $this->sendAlert($channel, $incident, $monitor, 'alert');
        }
    }

    public function sendIncidentResolved(Incident $incident): void
    {
        $monitor = $this->getMonitor($incident->monitor_id);
        if (!$monitor) {
            return;
        }

        $channels = $this->getTeamNotificationChannels($monitor['team_id']);

        foreach ($channels as $channel) {
            if (!$channel['is_enabled']) {
                continue;
            }

            $this->sendAlert($channel, $incident, $monitor, 'resolved');
        }
    }

    protected function sendAlert(array $channel, Incident $incident, array $monitor, string $type): void
    {
        $alertId = $this->db->insert(
            "INSERT INTO alerts_sent (incident_id, notification_channel_id, status) VALUES (?, ?, ?)",
            [$incident->id, $channel['id'], 'pending']
        );

        try {
            $config = json_decode($channel['config'], true);

            switch ($channel['type']) {
                case 'email':
                    $this->sendEmailAlert($config, $incident, $monitor, $type);
                    break;

                case 'telegram':
                    $this->sendTelegramAlert($config, $incident, $monitor, $type);
                    break;

                case 'webhook':
                    $this->sendWebhookAlert($config, $incident, $monitor, $type);
                    break;

                case 'whatsapp':
                    $this->sendWhatsAppAlert($config, $incident, $monitor, $type);
                    break;
            }

            $this->db->execute(
                "UPDATE alerts_sent SET status = ?, sent_at = ? WHERE id = ?",
                ['sent', now(), $alertId]
            );

        } catch (\Exception $e) {
            $this->db->execute(
                "UPDATE alerts_sent SET status = ?, error_message = ? WHERE id = ?",
                ['failed', $e->getMessage(), $alertId]
            );
        }
    }

    protected function sendEmailAlert(array $config, Incident $incident, array $monitor, string $type): void
    {
        $subject = $type === 'alert' 
            ? "🚨 Alert: {$monitor['name']} is down"
            : "✅ Resolved: {$monitor['name']} is back up";

        $body = $type === 'alert'
            ? "Your monitor '{$monitor['name']}' ({$monitor['url']}) is currently down.\n\nIncident: {$incident->title}\n\nStarted at: {$incident->started_at}"
            : "Your monitor '{$monitor['name']}' ({$monitor['url']}) is back up.\n\nIncident duration: {$incident->duration_seconds} seconds";

        $headers = "From: " . config('mail.from.address') . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        mail($config['email'], $subject, $body, $headers);
    }

    protected function sendTelegramAlert(array $config, Incident $incident, array $monitor, string $type): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        if (!$token) {
            throw new \Exception('Telegram bot token not configured');
        }

        $emoji = $type === 'alert' ? '🚨' : '✅';
        $status = $type === 'alert' ? 'DOWN' : 'UP';

        $message = "{$emoji} *{$status}*: {$monitor['name']}\n\n";
        $message .= "URL: {$monitor['url']}\n";
        $message .= "Incident: {$incident->title}\n";
        $message .= "Time: {$incident->started_at}";

        $this->httpClient->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'json' => [
                'chat_id' => $config['chat_id'],
                'text' => $message,
                'parse_mode' => 'Markdown',
            ],
        ]);
    }

    protected function sendWebhookAlert(array $config, Incident $incident, array $monitor, string $type): void
    {
        $payload = [
            'type' => $type,
            'monitor' => [
                'id' => $monitor['id'],
                'name' => $monitor['name'],
                'url' => $monitor['url'],
                'status' => $monitor['status'],
            ],
            'incident' => $incident->toArray(),
            'timestamp' => now(),
        ];

        $this->httpClient->post($config['url'], [
            'json' => $payload,
            'headers' => $config['headers'] ?? [],
        ]);
    }

    protected function sendWhatsAppAlert(array $config, Incident $incident, array $monitor, string $type): void
    {
        $apiUrl = env('WHATSAPP_API_URL');
        $apiKey = env('WHATSAPP_API_KEY');

        if (!$apiUrl || !$apiKey) {
            throw new \Exception('WhatsApp API not configured');
        }

        $emoji = $type === 'alert' ? '🚨' : '✅';
        $status = $type === 'alert' ? 'DOWN' : 'UP';

        $message = "{$emoji} *{$status}*: {$monitor['name']}\n\n";
        $message .= "URL: {$monitor['url']}\n";
        $message .= "Incident: {$incident->title}\n";
        $message .= "Time: {$incident->started_at}";

        $this->httpClient->post($apiUrl, [
            'json' => [
                'to' => $config['phone_number'],
                'message' => $message,
            ],
            'headers' => [
                'Authorization' => "Bearer {$apiKey}",
            ],
        ]);
    }

    protected function getMonitor(int $monitorId): ?array
    {
        return $this->db->queryOne("SELECT * FROM monitors WHERE id = ?", [$monitorId]);
    }

    protected function getTeamNotificationChannels(int $teamId): array
    {
        return $this->db->query(
            "SELECT * FROM notification_channels WHERE team_id = ? AND is_enabled = TRUE",
            [$teamId]
        );
    }
}
