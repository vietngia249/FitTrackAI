import { FastifyReply, FastifyRequest } from 'fastify';
import { authService } from './auth.service.js';
import { LoginInput, RegisterInput, GoogleAuthInput, updateProfileSchema } from './auth.schemas.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';

const REFRESH_COOKIE_NAME = 'fittrack_refresh_token';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export class AuthController {
  /**
   * Helper to set secure httpOnly refresh token cookie
   */
  private setRefreshCookie(reply: FastifyReply, token: string) {
    reply.setCookie(REFRESH_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }

  /**
   * Helper to clear refresh token cookie
   */
  private clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(REFRESH_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ) {
    const user = await authService.register(request.body);

    // Auto-login upon registration: issue tokens
    const { rawRefreshToken } = await authService.login({
      email: request.body.email,
      password: request.body.password,
    });

    const accessToken = request.server.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    this.setRefreshCookie(reply, rawRefreshToken);

    return reply.status(201).send({
      statusCode: 201,
      message: 'Account registered successfully',
      data: {
        user,
        accessToken,
      },
    });
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    const { user, rawRefreshToken } = await authService.login(request.body);

    const accessToken = request.server.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    this.setRefreshCookie(reply, rawRefreshToken);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Login successful',
      data: {
        user,
        accessToken,
      },
    });
  }

  async googleAuth(
    request: FastifyRequest<{ Body: GoogleAuthInput }>,
    reply: FastifyReply
  ) {
    const { user, rawRefreshToken } = await authService.loginWithGoogle(
      request.body.idToken
    );

    const accessToken = request.server.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    this.setRefreshCookie(reply, rawRefreshToken);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Google authentication successful',
      data: {
        user,
        accessToken,
      },
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshTokenFromCookie = request.cookies[REFRESH_COOKIE_NAME];
    const refreshTokenFromBody = (request.body as { refreshToken?: string })
      ?.refreshToken;

    const token = refreshTokenFromCookie || refreshTokenFromBody;

    if (!token) {
      throw AppError.unauthorized('Refresh token is required');
    }

    const { user, newRefreshToken } = await authService.refresh(token);

    const accessToken = request.server.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    this.setRefreshCookie(reply, newRefreshToken);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        user,
        accessToken,
      },
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const token =
      request.cookies[REFRESH_COOKIE_NAME] ||
      (request.body as { refreshToken?: string })?.refreshToken;

    if (token) {
      await authService.logout(token);
    }

    this.clearRefreshCookie(reply);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Logged out successfully',
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const user = await authService.getUserProfile(userId);

    return reply.status(200).send({
      statusCode: 200,
      data: {
        user,
      },
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const body = updateProfileSchema.parse(request.body);
    const user = await authService.updateUserProfile(userId, body);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  }
}

export const authController = new AuthController();
