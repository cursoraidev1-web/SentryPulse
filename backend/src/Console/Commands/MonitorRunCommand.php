<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use App\Services\MonitoringService;
use App\Repositories\MonitorRepository;
use App\Repositories\IncidentRepository;

class MonitorRunCommand extends Command
{
    protected static $defaultName = 'monitor:run';

    protected function configure(): void
    {
        $this->setDescription('Run all enabled monitor checks');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        require_once __DIR__ . '/../../../bootstrap/app.php';
        require_once __DIR__ . '/../../Helpers/helpers.php';

        $output->writeln('<info>Running monitor checks...</info>');

        $monitoringService = new MonitoringService(
            new MonitorRepository(db()),
            new IncidentRepository(db())
        );

        $results = $monitoringService->runAllChecks();

        $output->writeln(sprintf(
            '<info>Checked %d monitors</info>',
            count($results)
        ));

        $failures = array_filter($results, fn($r) => $r['status'] !== 'success');

        if (!empty($failures)) {
            $output->writeln(sprintf(
                '<comment>%d monitors failed</comment>',
                count($failures)
            ));
        }

        return Command::SUCCESS;
    }
}
