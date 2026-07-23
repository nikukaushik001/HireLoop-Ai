import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/api-error';
import { EmailService } from './email.service';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  private emailService = new EmailService();

  /**
   * Register a new recruiter
   */
  async register(data: RegisterDTO): Promise<{ message: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: 'RECRUITER', // All new signups are recruiters by default
        isApproved: false // Auto-approve disabled
      }
    });

    return { message: 'Account created successfully. Superadmin approval required then login.' };
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

    if (!user.isApproved) {
      throw new UnauthorizedError('Superadmin approval required then login');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Authenticate with Google
   */
  async googleLogin(token: string): Promise<AuthTokens> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedError('Invalid Google token payload');
      }

      let user = await prisma.user.findUnique({
        where: { email: payload.email }
      });

      if (!user) {
        // Create user
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || 'Google User',
            passwordHash,
            role: 'RECRUITER',
            isApproved: false
          }
        });
      }

      if (!user.isApproved) {
        throw new UnauthorizedError('Superadmin approval required then login');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.message === 'Superadmin approval required then login') {
        throw error;
      }
      throw new UnauthorizedError('Google authentication failed');
    }
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

  /**
   * Request password reset
   */
  async forgotPassword(email: string, origin?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return silently to prevent email enumeration
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires }
    });

    // Use the origin from the request if provided, otherwise fallback to the first CORS domain
    let frontendUrl = origin || env.CORS_ORIGIN.split(',')[0];
    frontendUrl = frontendUrl.trim();
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordReset(user.email, user.name, resetUrl);

    return { success: true };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return { success: true };
  }
}
