"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
async function aggregate() {
    try {
        logger_1.logger.info('Running analytics aggregation...');
        // Analytics aggregation logic would go here
        logger_1.logger.info('Analytics aggregation completed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Analytics aggregation failed:', error);
        process.exit(1);
    }
}
aggregate();
//# sourceMappingURL=analytics-aggregate.js.map