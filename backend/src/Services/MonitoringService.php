<?php

namespace App\Services;

use App\Models\Monitor;
use App\Repositories\MonitorRepository;
use App\Repositories\IncidentRepository;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class MonitoringService
{
    protected MonitorRepository $monitorRepository;
    protected IncidentRepository $incidentRepository;
    protected Client $httpClient;

    public function __construct(
        MonitorRepository $monitorRepository,
        IncidentRepository $incidentRepository
    ) {
        $this->monitorRepository = $monitorRepository;
        $this->incidentRepository = $incidentRepository;
        $this->httpClient = new Client([
            'timeout' => 30,
            'allow_redirects' => ['max' => 5],
            'verify' => true,
        ]);
    }

    public function checkMonitor(Monitor $monitor): array
    {
        $startTime = microtime(true);
        $result = [
            'status' => 'success',
            'status_code' => null,
            'response_time' => null,
            'error_message' => null,
            'ssl_valid' => null,
            'ssl_expires_at' => null,
            'dns_resolved' => null,
            'keyword_found' => null,
            'monitor_status' => 'up',
        ];

        try {
            $options = [
                'timeout' => $monitor->timeout,
                'headers' => $monitor->headers ?? [],
            ];

            if ($monitor->method === 'POST' && $monitor->body) {
                $options['body'] = $monitor->body;
            }

            $response = $this->httpClient->request($monitor->method, $monitor->url, $options);

            $endTime = microtime(true);
            $result['response_time'] = (int) (($endTime - $startTime) * 1000);
            $result['status_code'] = $response->getStatusCode();

            if ($result['status_code'] != $monitor->expected_status_code) {
                $result['status'] = 'failure';
                $result['monitor_status'] = 'down';
                $result['error_message'] = "Expected status {$monitor->expected_status_code}, got {$result['status_code']}";
            }

            if ($monitor->check_keyword) {
                $body = (string) $response->getBody();
                $result['keyword_found'] = str_contains($body, $monitor->check_keyword);

                if (!$result['keyword_found']) {
                    $result['status'] = 'failure';
                    $result['monitor_status'] = 'down';
                    $result['error_message'] = "Keyword '{$monitor->check_keyword}' not found";
                }
            }

            if ($monitor->check_ssl && str_starts_with($monitor->url, 'https://')) {
                $sslInfo = $this->checkSSL($monitor->url);
                $result['ssl_valid'] = $sslInfo['valid'];
                $result['ssl_expires_at'] = $sslInfo['expires_at'];

                if (!$sslInfo['valid']) {
                    $result['status'] = 'failure';
                    $result['monitor_status'] = 'down';
                    $result['error_message'] = $sslInfo['error'] ?? 'SSL certificate invalid';
                }
            }

            $result['dns_resolved'] = true;

        } catch (RequestException $e) {
            $result['status'] = 'failure';
            $result['monitor_status'] = 'down';
            $result['error_message'] = $e->getMessage();

            if ($e->hasResponse()) {
                $result['status_code'] = $e->getResponse()->getStatusCode();
            }
        } catch (\Exception $e) {
            $result['status'] = 'error';
            $result['monitor_status'] = 'down';
            $result['error_message'] = $e->getMessage();
        }

        $this->monitorRepository->createCheck($monitor->id, $result);
        $this->monitorRepository->updateCheckResult($monitor->id, $result);
        $this->monitorRepository->updateUptimePercentage($monitor->id);

        $this->handleIncident($monitor, $result);

        return $result;
    }

    protected function checkSSL(string $url): array
    {
        $result = [
            'valid' => false,
            'expires_at' => null,
            'error' => null,
        ];

        try {
            $parsedUrl = parse_url($url);
            $host = $parsedUrl['host'];
            $port = $parsedUrl['port'] ?? 443;

            $context = stream_context_create([
                'ssl' => [
                    'capture_peer_cert' => true,
                    'verify_peer' => true,
                    'verify_peer_name' => true,
                ]
            ]);

            $socket = @stream_socket_client(
                "ssl://{$host}:{$port}",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                $result['error'] = $errstr;
                return $result;
            }

            $params = stream_context_get_params($socket);
            $cert = openssl_x509_parse($params['options']['ssl']['peer_certificate']);

            $result['valid'] = true;
            $result['expires_at'] = date('Y-m-d H:i:s', $cert['validTo_time_t']);

            if ($cert['validTo_time_t'] < time()) {
                $result['valid'] = false;
                $result['error'] = 'Certificate expired';
            }

            fclose($socket);

        } catch (\Exception $e) {
            $result['error'] = $e->getMessage();
        }

        return $result;
    }

    protected function handleIncident(Monitor $monitor, array $checkResult): void
    {
        $activeIncident = $this->incidentRepository->findActiveByMonitor($monitor->id);

        if ($checkResult['monitor_status'] === 'down') {
            if (!$activeIncident) {
                $incident = $this->incidentRepository->create([
                    'monitor_id' => $monitor->id,
                    'title' => "{$monitor->name} is down",
                    'description' => $checkResult['error_message'] ?? 'Monitor check failed',
                    'status' => 'investigating',
                    'severity' => 'major',
                    'started_at' => now(),
                    'metadata' => [
                        'check_result' => $checkResult,
                    ],
                ]);

                app(NotificationService::class)->sendIncidentAlert($incident);
            }
        } else {
            if ($activeIncident) {
                $this->incidentRepository->resolve($activeIncident->id);

                app(NotificationService::class)->sendIncidentResolved($activeIncident);
            }
        }
    }

    public function runAllChecks(): array
    {
        $monitors = $this->monitorRepository->findEnabled();
        $results = [];

        foreach ($monitors as $monitor) {
            if ($this->shouldCheck($monitor)) {
                $results[$monitor->id] = $this->checkMonitor($monitor);
            }
        }

        return $results;
    }

    protected function shouldCheck(Monitor $monitor): bool
    {
        if (!$monitor->last_checked_at) {
            return true;
        }

        $lastChecked = strtotime($monitor->last_checked_at);
        $nextCheck = $lastChecked + $monitor->interval;

        return time() >= $nextCheck;
    }
}
