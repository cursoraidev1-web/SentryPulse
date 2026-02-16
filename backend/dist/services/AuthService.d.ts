import { User } from '../models/types';
export declare class AuthService {
    private userRepository;
    constructor();
    register(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    validateToken(token: string): Promise<User | null>;
    private generateToken;
    getUser(id: number): Promise<User | null>;
    updateProfile(userId: number, data: Partial<User>): Promise<Omit<User, 'password'>>;
}
//# sourceMappingURL=AuthService.d.ts.map