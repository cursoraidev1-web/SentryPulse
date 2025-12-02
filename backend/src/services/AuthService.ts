import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/types';
import { hashPassword, comparePassword } from '../utils/helpers';
import { config } from '../config/env';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: { name: string; email: string; password: string }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    await this.userRepository.updateLastLogin(user.id);

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return this.userRepository.findById(decoded.sub);
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async getUser(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateProfile(userId: number, data: Partial<User>): Promise<Omit<User, 'password'>> {
    await this.userRepository.update(userId, data);
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
