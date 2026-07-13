import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/api-error';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new recruiter
   */
  async register(data: RegisterDTO): Promise<AuthTokens> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: 'RECRUITER' // All new signups are recruiters by default
      }
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Authenticate a user
   */
  async login(data: LoginDTO): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(id: string, email: string, role: string): AuthTokens {
    const accessToken = jwt.sign({ id, email, role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any
    });

    const refreshToken = jwt.sign({ id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify token
   */
  verifyToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
