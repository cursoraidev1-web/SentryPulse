<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use App\Services\AnalyticsService;
use App\Repositories\SiteRepository;

class AnalyticsAggregateCommand extends Command
{
    protected static $defaultName = 'analytics:aggregate';

    protected function configure(): void
    {
        $this->setDescription('Aggregate analytics data')
            ->addOption('date', null, InputOption::VALUE_OPTIONAL, 'Date to aggregate (Y-m-d)', null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        require_once __DIR__ . '/../../../bootstrap/app.php';
        require_once __DIR__ . '/../../Helpers/helpers.php';

        $date = $input->getOption('date') ?? date('Y-m-d', strtotime('-1 day'));

        $output->writeln("<info>Aggregating analytics for {$date}...</info>");

        $analyticsService = new AnalyticsService(
            db(),
            new SiteRepository(db())
        );

        $analyticsService->aggregateDailyStats($date);

        $output->writeln('<info>Analytics aggregation completed!</info>');

        return Command::SUCCESS;
    }
}
