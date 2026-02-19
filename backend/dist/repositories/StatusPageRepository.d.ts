export declare class StatusPageRepository {
    findByTeam(teamId: number): Promise<any[]>;
    findById(id: number): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    create(data: {
        team_id: number;
        name: string;
        slug: string;
        domain?: string;
        is_public?: boolean;
    }): Promise<any>;
    update(id: number, data: {
        name?: string;
        slug?: string;
        domain?: string;
        is_public?: boolean;
    }): Promise<void>;
    delete(id: number): Promise<void>;
    getMonitors(statusPageId: number): Promise<any[]>;
    addMonitor(statusPageId: number, monitorId: number, displayOrder?: number): Promise<void>;
    removeMonitor(statusPageId: number, monitorId: number): Promise<void>;
}
//# sourceMappingURL=StatusPageRepository.d.ts.map