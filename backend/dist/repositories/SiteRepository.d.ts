import { Site } from '../models/types';
export declare class SiteRepository {
    findById(id: number): Promise<Site | null>;
    findByTeam(teamId: number): Promise<Site[]>;
    create(data: Partial<Site>): Promise<Site>;
    update(id: number, data: Partial<Pick<Site, 'name' | 'domain' | 'timezone' | 'is_enabled'>>): Promise<void>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=SiteRepository.d.ts.map