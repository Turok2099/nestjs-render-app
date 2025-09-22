import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/loging.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailsService } from '../emails/emails.service';
import { AuthResponse, AuthTokens } from './types';

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '24h';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '7d';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly emails: EmailsService,
  ) {}

  private async hash(data: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  private async signTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: ACCESS_TTL,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TTL,
    });
    return { accessToken, refreshToken };
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      address: dto.address ?? null,
      phone: dto.phone ?? null,
      passwordHash: await this.hash(dto.password),
      role: 'member',
    });
    await this.usersRepo.save(user);

    const { accessToken, refreshToken } = await this.signTokens(user);
    user.refreshTokenHash = await this.hash(refreshToken);
    await this.usersRepo.save(user);

    try {
      await this.emails.sendWelcome(user.email, user.name ?? user.email);
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar welcome a ${user.email}: ${err?.message ?? err}`,
      );
    }

    return { user: this.publicUser(user), accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('u.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new ForbiddenException('User is blocked');

    const { accessToken, refreshToken } = await this.signTokens(user);
    user.refreshTokenHash = await this.hash(refreshToken);
    await this.usersRepo.save(user);

    return { user: this.publicUser(user), accessToken, refreshToken };
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect(['u.refreshTokenHash'])
      .where('u.id = :id', { id: userId })
      .getOne();

    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) throw new UnauthorizedException();

    const tokens = await this.signTokens(user);

    user.refreshTokenHash = await this.hash(tokens.refreshToken);
    await this.usersRepo.save(user);

    return tokens;
  }

  async revokeRefresh(userId: string) {
    await this.usersRepo.update({ id: userId }, { refreshTokenHash: null });
    return { revoked: true };
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    // No revelar si existe o no
    if (!user) return { accepted: true };

    const raw = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');

    user.resetTokenHash = hash;
    user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await this.usersRepo.save(user);

    const base =
      process.env.FRONT_RESET_URL ||
      'http://localhost:3000/reset-password?token=';
    await this.emails.sendPasswordResetEmail(user.email, `${base}${raw}`);
    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hash = createHash('sha256').update(dto.token).digest('hex');
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect(['u.resetTokenHash'])
      .where('u.resetTokenHash = :hash', { hash })
      .getOne();

    if (
      !user ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.passwordHash = await this.hash(dto.newPassword);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await this.usersRepo.save(user);

    return { updated: true };
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    console.log('Iniciando login con Google');

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new BadRequestException('Missing GOOGLE_CLIENT_ID');
    }
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      throw new BadRequestException('Invalid Google token');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name ?? email.split('@')[0];

    console.log(`Procesando usuario: ${email} (${name})`);

    let user = await this.usersRepo.findOne({ where: { googleId } });

    if (!user) {
      user = await this.usersRepo.findOne({ where: { email } });
      if (user && !user.googleId) {
        user.googleId = googleId;
        await this.usersRepo.save(user);
      }
    }

    if (!user) {
      const randomPass = randomBytes(16).toString('hex');
      user = this.usersRepo.create({
        name,
        email,
        googleId,
        passwordHash: await this.hash(randomPass),
        role: 'member',
        address: null, //modificación
        phone: null, //modificación
      });
      await this.usersRepo.save(user);
      console.log('Usuario creado exitosamente✅');
    }

    if (user.isBlocked) throw new ForbiddenException('User is blocked');

    const { accessToken, refreshToken } = await this.signTokens(user);
    user.refreshTokenHash = await this.hash(refreshToken);
    await this.usersRepo.save(user);

    return { user: this.publicUser(user), accessToken, refreshToken };
  }
  async completeGoogleRegistration(dto: {
    email: string;
    address: string;
    phone: string;
  }): Promise<AuthResponse & { needsCompletion: boolean }> {
    const { email, address, phone } = dto;

    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    user.address = address;
    user.phone = phone;
    await this.usersRepo.save(user);

    try {
      await this.emails.sendWelcome(user.email, user.name ?? user.email);
      this.logger?.log?.(
        `Welcome (Google COMPLETE nuevo) enviado a ${user.email}`,
      );
    } catch (err) {
      this.logger?.warn?.(
        `No se pudo enviar welcome (Google COMPLETE nuevo) a ${user.email}: ${err?.message ?? err}`,
      );
    }

    const { accessToken, refreshToken } = await this.signTokens(user);
    user.refreshTokenHash = await this.hash(refreshToken);
    await this.usersRepo.save(user);

    const hasAddress = user.address && user.address.trim() !== '';
    const hasPhone = user.phone && user.phone.trim() !== '';
    const needsCompletion = !hasAddress || !hasPhone;

    console.log('✅ Datos completados:', {
      hasAddress,
      hasPhone,
      needsCompletion,
    });

    return {
      user: this.publicUser(user),
      accessToken,
      refreshToken,
      needsCompletion,
    };
  }

  async syncGoogleUser(dto: {
    email: string;
    name: string;
  }): Promise<AuthResponse> {
    const { email, name } = dto;

    console.log('🔄 Sincronizando usuario existente:', email);

    let user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      console.log('🆕 Usuario no encontrado, creando nuevo usuario');
      const randomPass = randomBytes(16).toString('hex');
      user = this.usersRepo.create({
        name,
        email,
        passwordHash: await this.hash(randomPass),
        role: 'member',
        address: null,
        phone: null,
      });
      await this.usersRepo.save(user);
    }

    if (user.isBlocked) {
      throw new ForbiddenException('User is blocked');
    }

    const { accessToken, refreshToken } = await this.signTokens(user);
    user.refreshTokenHash = await this.hash(refreshToken);
    await this.usersRepo.save(user);

    return { user: this.publicUser(user), accessToken, refreshToken };
  }
}
