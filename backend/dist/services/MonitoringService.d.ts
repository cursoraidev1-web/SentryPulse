import { Monitor } from '../models/types';
export declare class MonitoringService {
    private monitorRepository;
    constructor();
    checkMonitor(monitor: Monitor): Promise<any>;
    private checkSSL;
    runAllChecks(): Promise<any>;
    private shouldCheck;
}
//# sourceMappingURL=MonitoringService.d.ts.map