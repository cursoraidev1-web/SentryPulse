import { Monitor } from '../models/types';
export declare class MonitorRepository {
    findById(id: number): Promise<Monitor | null>;
    findByTeam(teamId: number): Promise<Monitor[]>;
    findEnabled(): Promise<Monitor[]>;
    create(data: Partial<Monitor>): Promise<Monitor>;
    update(id: number, data: Partial<Monitor>): Promise<void>;
    updateCheckResult(id: number, data: any): Promise<void>;
    createCheck(monitorId: number, data: any): Promise<number>;
    getChecks(monitorId: number, limit?: number): Promise<any[]>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=MonitorRepository.d.ts.map