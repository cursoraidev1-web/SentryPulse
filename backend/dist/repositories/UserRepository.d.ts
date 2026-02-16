import { User } from '../models/types';
export declare class UserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    update(id: number, data: Partial<User>): Promise<void>;
    updateLastLogin(id: number): Promise<void>;
}
//# sourceMappingURL=UserRepository.d.ts.map