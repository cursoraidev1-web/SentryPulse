import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { bcryptHash, bcryptVerify, config, uuid } from '../core/helpers.js';

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcryptHash(data.password);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      timezone: data.timezone || 'UTC'
    });

    const token = this.generateToken(user);

    return {
      user: user.toArray(),
      token
    };
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcryptVerify(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    await this.userRepository.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      user: user.toArray(),
      token
    };
  }

  async validateToken(token) {
    try {
      const jwtConfig = config('jwt');
      const decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algo]
      });

      return await this.userRepository.findById(decoded.sub);
    } catch (error) {
      return null;
    }
  }

  generateToken(user) {
    const jwtConfig = config('jwt');
    const appConfig = config('app');

    const payload = {
      iss: appConfig.url,
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (jwtConfig.ttl * 60),
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid()
    };

    return jwt.sign(payload, jwtConfig.secret, {
      algorithm: jwtConfig.algo
    });
  }

  async refreshToken(token) {
    const user = await this.validateToken(token);

    if (!user) {
      throw new Error('Invalid token');
    }

    return this.generateToken(user);
  }

  async getUser(id) {
    return await this.userRepository.findById(id);
  }

  async updateProfile(userId, data) {
    await this.userRepository.update(userId, data);
    return await this.userRepository.findById(userId);
  }
}





