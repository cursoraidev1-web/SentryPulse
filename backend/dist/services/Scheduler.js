"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const MonitoringService_1 = require("./MonitoringService");
const startScheduler = () => {
    console.log('🕒 Monitoring Scheduler Started...');
    // Run every 10 seconds
    node_cron_1.default.schedule('*/10 * * * * *', async () => {
        const monitoringService = new MonitoringService_1.MonitoringService();
        try {
            await monitoringService.runAllChecks();
        }
        catch (error) {
            console.error('Scheduler Error:', error);
        }
    });
};
exports.startScheduler = startScheduler;
// 👇 THIS IS THE MISSING KEY!
(0, exports.startScheduler)();
//# sourceMappingURL=Scheduler.js.map