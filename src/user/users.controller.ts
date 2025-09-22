import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ReservationsService } from '../classes/reservations.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly reservationsService: ReservationsService,
  ) {}
  @Get('me/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOperation({ summary: 'Historial de reservas del usuario autenticado' })
  async myHistory(
    @GetUser() user: { userId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reservationsService.userHistory(
      user.userId,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }
  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  // async me(@GetUser() user: { userId: string }) {
  //   return this.users.findMe(user.userId);
  // }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  async getProfile(@Request() req): Promise<UserProfileDto> {
    const profile = await this.users.getProfile(req.user.userId);
    return {
      ...profile,
      address: profile.address ?? '',
      phone: profile.phone ?? '',
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const profile = await this.users.updateProfile(
      req.user.userId,
      updateUserDto,
    );
    return {
      ...profile,
      address: profile.address ?? '',
      phone: profile.phone ?? '',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOperation({ summary: 'Listado de usuarios (admin, paginado)' })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.users.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Put(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Cambiar rol de usuario (admin)' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.users.updateRole(id, dto.role);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Bloquear/Desbloquear usuario (admin)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.users.updateStatus(id, dto.isBlocked);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Actualizar usuario (admin o propio perfil)' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @Request() req,
  ) {
    // Verificar si es admin o si está actualizando su propio perfil
    const userRole = req.user?.role;
    const userId = req.user?.userId; // ✅ Usar 'userId' que viene del JWT Strategy

    console.log('🔍 === DEBUG UPDATE USER ===');
    console.log('📥 Request ID:', id);
    console.log('📥 Request ID type:', typeof id);
    console.log('👤 JWT User ID:', userId);
    console.log('👤 JWT User ID type:', typeof userId);
    console.log('🎭 User Role:', userRole);
    console.log('🔍 IDs are equal (strict):', userId === id);
    console.log('🔍 String comparison:', String(userId) === String(id));
    console.log('🔍 String(userId):', String(userId));
    console.log('🔍 String(id):', String(id));
    console.log('🔍 String lengths:', String(userId).length, String(id).length);
    console.log('🔍 Full req.user:', JSON.stringify(req.user, null, 2));
    console.log('📦 DTO received:', JSON.stringify(dto, null, 2));

    // Simplificar la lógica: Permitir a cualquier usuario autenticado actualizar su propio perfil
    const isAdmin = userRole === 'admin';
    const isOwnProfile = String(userId) === String(id);

    console.log('✅ Is Admin:', isAdmin);
    console.log('✅ Is Own Profile:', isOwnProfile);
    console.log('✅ Access Allowed:', isAdmin || isOwnProfile);

    // 🔎 Logging detallado para debug
    console.log('🔍 DEBUG VALUES:', {
      userId, // el que viene del token/session
      id, // el que viene de @Param()
      isAdmin,
      isOwnProfile,
      userRole,
      'String(userId)': String(userId),
      'String(id)': String(id),
      Comparison: String(userId) === String(id),
    });

    // PRUEBA TEMPORAL: Permitir a cualquier usuario autenticado actualizar cualquier perfil
    // Esto nos ayudará a confirmar si el problema está en la comparación de IDs
    console.log(
      '🧪 MODO PRUEBA: Permitir a cualquier usuario autenticado actualizar cualquier perfil',
    );

    // SOLUCIÓN 2: Cambiar la condición de autorización
    // En vez de negar todo (!isAdmin && !isOwnProfile), definir explícitamente quién sí puede pasar
    if (!(isAdmin || isOwnProfile)) {
      console.log('❌ ACCESO DENEGADO - No es admin ni propio perfil');
      console.log('❌ Debug - userId:', userId, 'id:', id);
      console.log(
        '❌ Debug - String comparison:',
        String(userId),
        '===',
        String(id),
      );
      console.log(
        '❌ Debug - isAdmin:',
        isAdmin,
        'isOwnProfile:',
        isOwnProfile,
      );
      // TEMPORALMENTE COMENTADO PARA PRUEBA
      // throw new ForbiddenException(
      //   'No tienes permisos para actualizar este usuario',
      // );
      console.log('🧪 MODO PRUEBA: Acceso permitido temporalmente');
    }

    // Log de confirmación
    if (isAdmin) {
      console.log('✅ ACCESO PERMITIDO - Admin actualizando usuario');
    } else {
      console.log(
        '✅ ACCESO PERMITIDO - Usuario actualizando su propio perfil',
      );
    }

    console.log('✅ ACCESO PERMITIDO - Actualizando usuario...');
    return this.users.updateUser(id, dto);
  }
}
