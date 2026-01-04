import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'sentrypulse',
});

console.log('Testing database connection...');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`User: ${process.env.DB_USERNAME || 'postgres'}`);
console.log(`Database: ${process.env.DB_DATABASE || 'sentrypulse'}`);

try {
  const result = await pool.query('SELECT NOW()');
  console.log('✓ Database connection successful!');
  console.log(`Server time: ${result.rows[0].now}`);
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('✗ Database connection failed:', error.message);
  console.error('\nCommon solutions:');
  console.error('1. Check if PostgreSQL is running');
  console.error('2. Verify username and password in .env file');
  console.error('3. Check pg_hba.conf authentication settings');
  console.error('4. Try resetting postgres password:');
  console.error('   ALTER USER postgres WITH PASSWORD \'your_password\';');
  await pool.end();
  process.exit(1);
}




