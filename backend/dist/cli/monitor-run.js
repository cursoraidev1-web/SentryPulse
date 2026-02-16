"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MonitoringService_1 = require("../services/MonitoringService");
const logger_1 = require("../utils/logger");
async function main() {
    try {
        logger_1.logger.info('Running monitor checks...');
        const monitoringService = new MonitoringService_1.MonitoringService();
        const results = await monitoringService.runAllChecks();
        const count = Object.keys(results).length;
        logger_1.logger.info(`Checked ${count} monitors`);
        const failures = Object.values(results).filter((r) => r.status !== 'success');
        if (failures.length > 0) {
            logger_1.logger.warn(`${failures.length} monitors failed`);
        }
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Monitor run failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=monitor-run.js.map