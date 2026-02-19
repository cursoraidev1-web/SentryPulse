"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrations_1 = require("../database/migrations");
async function main() {
    try {
        console.log('Running database migrations...\n');
        await (0, migrations_1.runMigrations)();
        console.log('\nMigrations complete!');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=migrate.js.map