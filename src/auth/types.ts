import { UserRole } from '../user/entities/user.entity';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  address: string | null;
  phone: string | null;
  createdAt: Date;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: PublicUser;
} & AuthTokens;
