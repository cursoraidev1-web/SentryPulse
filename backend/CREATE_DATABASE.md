# Create SentryPulse Database

Based on your connection string, you're using:
- **Username**: postgres
- **Password**: password
- **Host**: localhost
- **Port**: 5432

## Option 1: Using SQL Script (Recommended)

Run the provided SQL script:

```bash
psql -U postgres -f scripts/create-database.sql
```

When prompted, enter password: `password`

This will:
- Create the `sentrypulse` database
- Create a `sentrypulse` user (optional)
- Grant necessary privileges

## Option 2: Manual Creation

Connect to PostgreSQL:

```bash
psql -U postgres -h localhost -p 5432
```

Enter password: `password`

Then run:

```sql
-- Create the database
CREATE DATABASE sentrypulse;

-- Exit
\q
```

## Option 3: Using psql Command Line

Create database directly:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE sentrypulse;"
```

Enter password: `password` when prompted

## Update .env File

Your `.env` file should now have:

```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=sentrypulse
DB_USERNAME=postgres
DB_PASSWORD=password
```

## Test Connection

After creating the database, test it:

```bash
cd backend
node scripts/test-db.js
```

You should see:
```
✓ Database connection successful!
```

## Next Steps

After the database is created, you'll need to run migrations to create the tables. The migration files are in `backend/database/migrations/` (currently in PHP format, but you'll need to convert them to SQL or create new ones).



