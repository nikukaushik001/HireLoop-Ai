import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { users } from '../../db/schema/users';
import { organizations } from '../../db/schema/organizations';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../utils/api-error';

// ── Types ─────────────────────────────────────────────────────────

export interface RegisterDTO {
  orgName: string;
  orgWebsite?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Token Utilities ───────────────────────────────────────────────

/**
 * Sign a new JWT Access Token (short-lived).
 */
export function signAccessToken(payload: { id: string; email: string; organizationId: string; role: string }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
}

/**
 * Sign a new JWT Refresh Token (long-lived).
 */
export function signRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}

/**
 * Verify a JWT Token safely.
 */
export function verifyToken(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// ── Business Logic ────────────────────────────────────────────────

export class AuthService {
  /**
   * Register a new Organization and its first Admin User.
   * We use a transaction because we must create BOTH or NEITHER.
   */
  async register(data: RegisterDTO): Promise<AuthTokens> {
    // 1. Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictError('Email is already registered');
    }

    // 2. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // 3. Execute transaction
    const result = await db.transaction(async (tx) => {
      // Create Organization
      const [newOrg] = await tx
        .insert(organizations)
        .values({
          name: data.orgName,
          slug: data.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          website: data.orgWebsite,
        })
        .returning();

      // Create Admin User
      const [newUser] = await tx
        .insert(users)
        .values({
          organizationId: newOrg.id,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'admin', // First user is always admin
        })
        .returning();

      return newUser;
    });

    // 4. Generate Tokens
    const accessToken = signAccessToken({
      id: result.id,
      email: result.email,
      organizationId: result.organizationId,
      role: result.role,
    });
    
    const refreshToken = signRefreshToken({ id: result.id });

    // 5. Save refresh token to user record
    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, result.id));

    return { accessToken, refreshToken };
  }

  /**
   * Authenticate a user and return tokens.
   */
  async login(data: LoginDTO): Promise<AuthTokens> {
    // 1. Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is deactivated');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Generate tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });
    
    const refreshToken = signRefreshToken({ id: user.id });

    // 4. Save refresh token & update last login
    await db
      .update(users)
      .set({ 
        refreshToken, 
        lastLoginAt: new Date() 
      })
      .where(eq(users.id, user.id));

    return { accessToken, refreshToken };
  }

  /**
   * Exchange a valid refresh token for a new access token.
   */
  async refresh(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // 1. Verify token signature and expiry
    const payload = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

    // 2. Check if token matches the one in DB (detects revocation/hijacking)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid or revoked refresh token');
    }

    // 3. Issue new access token
    return signAccessToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });
  }

  /**
   * Logout user by invalidating their refresh token in the DB.
   */
  async logout(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, userId));
  }
}
