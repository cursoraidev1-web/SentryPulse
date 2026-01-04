# Fix PostgreSQL Authentication

The password in your `.env` file doesn't match your PostgreSQL postgres user password.

## Solution 1: Reset PostgreSQL Password (Recommended)

1. **Connect to PostgreSQL as the postgres superuser** (you may need to use Windows authentication or find your actual postgres password):

   For Windows, you can try:
   ```bash
   # Try with Windows authentication (if configured)
   psql -U postgres
   
   # Or if that doesn't work, you may need to:
   # 1. Find PostgreSQL bin directory (usually C:\Program Files\PostgreSQL\15\bin)
   # 2. Run: psql.exe -U postgres
   # 3. Enter your postgres password when prompted
   ```

2. **Once connected, reset the password**:
   ```sql
   ALTER USER postgres WITH PASSWORD 'secret';
   ```

3. **Create the database and user** (if not already done):
   ```sql
   CREATE DATABASE sentrypulse;
   CREATE USER sentrypulse WITH PASSWORD 'secret';
   GRANT ALL PRIVILEGES ON DATABASE sentrypulse TO sentrypulse;
   ```

4. **Exit PostgreSQL**:
   ```sql
   \q
   ```

## Solution 2: Update .env with Correct Password

If you know your postgres password, just update the `.env` file:

1. Open `backend/.env`
2. Change `DB_PASSWORD=secret` to your actual postgres password
3. Save the file

## Solution 3: Use a Different User

If you have another PostgreSQL user, update `.env`:

```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Test the Connection

After fixing, test the connection:

```bash
cd backend
node scripts/test-db.js
```

If successful, you'll see:
```
✓ Database connection successful!
```

## If You Don't Remember Your PostgreSQL Password

**Windows:**

1. Stop PostgreSQL service:
   ```powershell
   net stop postgresql-x64-15  # Replace with your version
   ```

2. Edit `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\15\data\`):
   - Change `md5` to `trust` for local connections
   - Save the file

3. Start PostgreSQL:
   ```powershell
   net start postgresql-x64-15
   ```

4. Connect without password:
   ```bash
   psql -U postgres
   ```

5. Reset password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'secret';
   ```

6. Revert `pg_hba.conf` (change `trust` back to `md5`)

7. Restart PostgreSQL

## Quick Test Commands

```bash
# Test connection
cd backend
node scripts/test-db.js

# Or test manually with psql
psql -U postgres -d sentrypulse -c "SELECT 1"
```




