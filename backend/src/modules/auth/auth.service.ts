import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
} from '../../shared/utils/security.js';
import { LoginInput, RegisterInput } from './auth.schemas.js';
import { UserWithProfile } from './auth.types.js';

export class AuthService {
  /**
   * Register a new user and generate their initial fitness profile
   */
  async register(input: RegisterInput): Promise<UserWithProfile> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.badRequest('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          displayName: input.displayName,
          profile: {
            create: {
              fitnessGoal: input.fitnessGoal,
              preferredUnits: input.preferredUnits,
              locale: input.locale,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      return newUser;
    });

    // Strip passwordHash before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Authenticate a user and create a refresh token session
   */
  async login(
    input: LoginInput
  ): Promise<{ user: UserWithProfile; rawRefreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(
      user.passwordHash,
      input.password
    );

    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate refresh token (valid for 7 days)
    const rawRefreshToken = generateRandomToken(32);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, rawRefreshToken };
  }

  /**
   * Rotate a refresh token and return the associated user
   */
  async refresh(
    rawRefreshToken: string
  ): Promise<{ user: UserWithProfile; newRefreshToken: string }> {
    const hashed = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash: hashed },
      include: { user: { include: { profile: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Token rotation: Revoke current token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new refresh token
    const newRefreshToken = generateRandomToken(32);
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = storedToken.user;
    return { user: safeUser, newRefreshToken };
  }

  /**
   * Revoke an active refresh token
   */
  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;

    const hashed = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashed,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: string): Promise<UserWithProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
