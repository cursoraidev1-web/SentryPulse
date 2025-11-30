<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use App\Queue\QueueManager;

class QueueWorkCommand extends Command
{
    protected static $defaultName = 'queue:work';

    protected function configure(): void
    {
        $this->setDescription('Process jobs on the queue')
            ->addOption('queue', null, InputOption::VALUE_OPTIONAL, 'Queue name', 'default')
            ->addOption('max-jobs', null, InputOption::VALUE_OPTIONAL, 'Maximum jobs to process', 0)
            ->addOption('sleep', null, InputOption::VALUE_OPTIONAL, 'Seconds to sleep between jobs', 3);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        require_once __DIR__ . '/../../../bootstrap/app.php';
        require_once __DIR__ . '/../../Helpers/helpers.php';

        $queueName = $input->getOption('queue');
        $maxJobs = (int) $input->getOption('max-jobs');
        $sleep = (int) $input->getOption('sleep');

        $queueManager = new QueueManager($queueName);

        $output->writeln("<info>Processing queue: {$queueName}</info>");

        $processed = 0;

        while (true) {
            $job = $queueManager->pop();

            if (!$job) {
                if ($maxJobs > 0 && $processed >= $maxJobs) {
                    break;
                }
                sleep($sleep);
                continue;
            }

            try {
                $output->writeln("Processing job: {$job['class']}");

                $jobClass = $job['class'];
                $jobInstance = new $jobClass($job['data']);
                $jobInstance->handle();

                $output->writeln("<info>✓ Job completed</info>");
                $processed++;

            } catch (\Exception $e) {
                $output->writeln("<error>✗ Job failed: {$e->getMessage()}</error>");

                $job['attempts']++;

                if ($job['attempts'] < 3) {
                    $queueManager->push($job['class'], $job['data']);
                } else {
                    $queueManager->failed($job, $e->getMessage());
                }
            }

            if ($maxJobs > 0 && $processed >= $maxJobs) {
                break;
            }
        }

        $output->writeln("<info>Processed {$processed} jobs</info>");

        return Command::SUCCESS;
    }
}
