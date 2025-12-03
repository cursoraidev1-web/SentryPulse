import { runMigrations } from '../database/migrations';

async function main() {
  try {
    console.log('Running database migrations...\n');
    await runMigrations();
    console.log('\nMigrations complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
