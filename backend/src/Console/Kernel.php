<?php

namespace App\Console;

use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Kernel
{
    protected Application $console;

    public function __construct()
    {
        $this->console = new Application('SentryPulse', '1.0.0');
        $this->registerCommands();
    }

    protected function registerCommands(): void
    {
        $this->console->add(new Commands\MigrateCommand());
        $this->console->add(new Commands\SeedCommand());
        $this->console->add(new Commands\MonitorRunCommand());
        $this->console->add(new Commands\QueueWorkCommand());
        $this->console->add(new Commands\AnalyticsAggregateCommand());
    }

    public function handle(InputInterface $input, OutputInterface $output): int
    {
        return $this->console->run($input, $output);
    }

    public function terminate(InputInterface $input, int $status): void
    {
    }
}
