import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto'; 
import { LoginDto } from './dto/loging.dto'; 
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleTokenDto } from './dto/google.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleCompleteDto } from './dto/google-complete.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isProd, 
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro por email y contraseña' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login por email y contraseña' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @Post('google')
  @ApiOperation({ summary: 'Login con Google (ID token)' })
  async google(@Body() { idToken }: GoogleTokenDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.googleLogin(idToken);
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @Post('google/complete')
  @ApiOperation({ summary: 'Completar registro de Google con datos adicionales',})
  async googleComplete(
    @Body() dto: GoogleCompleteDto,
    @Res({ passthrough: true }) res: Response,
  ){
    const { user, accessToken, refreshToken, needsCompletion} =
    await this.auth.completeGoogleRegistration(dto);      
    this.setRefreshCookie(res, refreshToken);
    return {user, accessToken, needsCompletion}
  }

  @Post('forgot-password')
  @HttpCode(202)
  @ApiOperation({ summary: 'Enviar email con link de reseteo' })
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Cambiar contraseña con token de un solo uso' })
  async reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Obtener nuevo access token usando la cookie de refresh', })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return { error: 'No refresh token' };
    try {
      const payload: any = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const tokens = await this.auth.refresh(payload.sub, refreshToken);
      this.setRefreshCookie(res, tokens.refreshToken); // rotate
      return { accessToken: tokens.accessToken };
    } catch {
      return { error: 'Invalid token' };
    }
  }

  @Post('logout')
  @HttpCode(204)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Cerrar sesión: limpia cookie y revoca refresh' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      try {
        const payload: any = this.jwt.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
        await this.auth.revokeRefresh(payload.sub); 
      } catch {

      }
    }
    res.clearCookie('refresh_token', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return;
  }
}
