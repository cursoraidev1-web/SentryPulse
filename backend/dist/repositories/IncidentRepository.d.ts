export declare class IncidentRepository {
    findByTeam(teamId: number): Promise<any[]>;
    findById(id: number): Promise<any>;
    create(data: any): Promise<any[]>;
    update(id: number, data: {
        title?: string;
        description?: string;
        status?: string;
    }): Promise<void>;
    resolve(id: number): Promise<void>;
}
//# sourceMappingURL=IncidentRepository.d.ts.map