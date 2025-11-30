<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SeedCommand extends Command
{
    protected static $defaultName = 'db:seed';

    protected function configure(): void
    {
        $this->setDescription('Seed the database with test data');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        require_once __DIR__ . '/../../../bootstrap/app.php';
        require_once __DIR__ . '/../../Helpers/helpers.php';

        $db = db();
        $output->writeln('<info>Seeding database...</info>');

        $userPassword = bcrypt('password');

        $userId = $db->insert(
            "INSERT INTO users (name, email, password, email_verified_at) VALUES (?, ?, ?, ?)",
            ['Admin User', 'admin@sentrypulse.com', $userPassword, now()]
        );

        $teamUuid = uuid();
        $teamId = $db->insert(
            "INSERT INTO teams (uuid, name, slug, owner_id, plan) VALUES (?, ?, ?, ?, ?)",
            [$teamUuid, 'SentryPulse Team', 'sentrypulse-team', $userId, 'pro']
        );

        $db->execute(
            "INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)",
            [$teamId, $userId, 'owner']
        );

        $siteId = $db->insert(
            "INSERT INTO sites (team_id, name, domain, tracking_code, is_enabled, public_stats) VALUES (?, ?, ?, ?, ?, ?)",
            [$teamId, 'Demo Site', 'demo.sentrypulse.com', 'SP_' . strtoupper(substr(md5(uniqid()), 0, 12)), true, true]
        );

        $monitorId = $db->insert(
            "INSERT INTO monitors (team_id, name, url, type, method, interval, is_enabled, check_ssl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$teamId, 'Main Website', 'https://example.com', 'https', 'GET', 60, true, true]
        );

        $db->insert(
            "INSERT INTO notification_channels (team_id, name, type, is_enabled, config) VALUES (?, ?, ?, ?, ?)",
            [$teamId, 'Default Email', 'email', true, json_encode(['email' => 'admin@sentrypulse.com'])]
        );

        $statusPageId = $db->insert(
            "INSERT INTO status_pages (team_id, name, slug, is_public) VALUES (?, ?, ?, ?)",
            [$teamId, 'Public Status', 'public-status', true]
        );

        $db->insert(
            "INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)",
            [$statusPageId, $monitorId, 1]
        );

        $output->writeln('  <comment>✓</comment> Created demo user (admin@sentrypulse.com / password)');
        $output->writeln('  <comment>✓</comment> Created demo team');
        $output->writeln('  <comment>✓</comment> Created demo site for analytics');
        $output->writeln('  <comment>✓</comment> Created demo monitor');
        $output->writeln('  <comment>✓</comment> Created notification channel');
        $output->writeln('  <comment>✓</comment> Created status page');

        $output->writeln('<info>Database seeded successfully!</info>');

        return Command::SUCCESS;
    }
}
