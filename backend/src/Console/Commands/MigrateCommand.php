<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateCommand extends Command
{
    protected static $defaultName = 'migrate';

    protected function configure(): void
    {
        $this->setDescription('Run database migrations')
            ->addOption('seed', null, InputOption::VALUE_NONE, 'Seed the database after migration');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        require_once __DIR__ . '/../../../bootstrap/app.php';
        require_once __DIR__ . '/../../Helpers/helpers.php';

        $db = db();
        $migrationsPath = __DIR__ . '/../../../database/migrations';
        $files = glob($migrationsPath . '/*.php');
        sort($files);

        $output->writeln('<info>Running migrations...</info>');

        foreach ($files as $file) {
            $migration = require $file;
            $migrationName = basename($file, '.php');

            try {
                $db->execute($migration['up']);
                $output->writeln("  <comment>✓</comment> {$migrationName}");
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'already exists')) {
                    $output->writeln("  <comment>-</comment> {$migrationName} (already exists)");
                } else {
                    $output->writeln("  <error>✗</error> {$migrationName}: {$e->getMessage()}");
                    return Command::FAILURE;
                }
            }
        }

        $output->writeln('<info>Migrations completed successfully!</info>');

        if ($input->getOption('seed')) {
            $seedCommand = new SeedCommand();
            return $seedCommand->execute($input, $output);
        }

        return Command::SUCCESS;
    }
}
