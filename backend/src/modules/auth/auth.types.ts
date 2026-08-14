import { FitnessProfile, User } from '@prisma/client';

export interface JWTPayload {
  id: string;
  email: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface UserWithProfile extends SafeUser {
  profile: FitnessProfile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserWithProfile;
  accessToken: string;
}
