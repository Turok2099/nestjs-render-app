import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as bcrypt from 'bcryptjs';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check básico' })
  @ApiResponse({ status: 200, description: 'Servicio funcionando' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'NuevoTrain Backend',
      version: '1.0.0',
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Verificar conexión a base de datos' })
  @ApiResponse({ status: 200, description: 'Conexión exitosa' })
  @ApiResponse({ status: 500, description: 'Error de conexión' })
  async checkDatabase() {
    try {
      // Verificar conexión
      await this.dataSource.query('SELECT 1');

      // Obtener información de las tablas
      const tables = await this.getTablesInfo();

      return {
        status: 'ok',
        database: 'connected',
        provider: 'Neon PostgreSQL',
        timestamp: new Date().toISOString(),
        tables: tables,
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('tables')
  @ApiOperation({ summary: 'Listar todas las tablas y sus registros' })
  @ApiResponse({ status: 200, description: 'Información de tablas obtenida' })
  async getTablesInfo() {
    try {
      const tables = [
        'users',
        'locations',
        'classes',
        'class_histories',
        'reservations',
        'reviews',
        'comments',
        'plans',
        'subscriptions',
        'payments',
        'exercises',
        'subscription_reminders',
      ];

      const tableInfo: any[] = [];

      for (const tableName of tables) {
        try {
          // Verificar si la tabla existe
          const tableExists = await this.dataSource.query(
            `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            );
          `,
            [tableName],
          );

          if (tableExists[0].exists) {
            // Contar registros
            const countResult = await this.dataSource.query(
              `SELECT COUNT(*) as count FROM ${tableName}`,
            );

            // Obtener estructura de la tabla
            const columns = await this.dataSource.query(
              `
              SELECT column_name, data_type, is_nullable, column_default
              FROM information_schema.columns 
              WHERE table_name = $1 
              ORDER BY ordinal_position
            `,
              [tableName],
            );

            tableInfo.push({
              name: tableName,
              exists: true,
              recordCount: parseInt(countResult[0].count),
              columns: columns.map((col) => ({
                name: col.column_name,
                type: col.data_type,
                nullable: col.is_nullable === 'YES',
                default: col.column_default,
              })),
            });
          } else {
            tableInfo.push({
              name: tableName,
              exists: false,
              recordCount: 0,
              columns: [],
            });
          }
        } catch (tableError) {
          tableInfo.push({
            name: tableName,
            exists: false,
            error: tableError.message,
            recordCount: 0,
            columns: [],
          });
        }
      }

      return tableInfo;
    } catch (error) {
      throw new Error(
        `Error al obtener información de tablas: ${error.message}`,
      );
    }
  }

  @Get('test-insert')
  @ApiOperation({ summary: 'Probar inserción en base de datos' })
  @ApiResponse({ status: 200, description: 'Inserción de prueba exitosa' })
  async testInsert() {
    try {
      // Crear una ubicación de prueba
      const testLocation = await this.dataSource.query(
        `
          INSERT INTO locations (name, country, city, address, lat, lng, "isActive", created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `,
        [
          'Gimnasio de Prueba ' + Date.now(),
          'Argentina',
          'Buenos Aires',
          'Av. Test 123',
          '-34.6037',
          '-58.3816',
          true,
          new Date(),
          new Date(),
        ],
      );

      return {
        status: 'ok',
        message: 'Inserción de prueba exitosa',
        data: testLocation[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error en inserción de prueba',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar todos los usuarios registrados' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida' })
  async getUsers() {
    try {
      const users = await this.dataSource.query(
        'SELECT id, name, email, role, "isBlocked", created_at FROM users ORDER BY created_at DESC',
      );

      return {
        status: 'ok',
        message: 'Usuarios obtenidos exitosamente',
        count: users.length,
        users: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al obtener usuarios',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('user/:email')
  @ApiOperation({ summary: 'Verificar hash de contraseña de un usuario' })
  @ApiResponse({ status: 200, description: 'Información del usuario obtenida' })
  async getUserPasswordHash(@Param('email') email: string) {
    try {
      const user = await this.dataSource.query(
        'SELECT id, name, email, role, "isBlocked", password_hash, created_at FROM users WHERE email = $1',
        [email],
      );

      if (user.length === 0) {
        return {
          status: 'error',
          message: 'Usuario no encontrado',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'ok',
        message: 'Usuario encontrado',
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
          isBlocked: user[0].isBlocked,
          password_hash: user[0].password_hash,
          created_at: user[0].created_at,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al obtener usuario',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-password/:email/:password')
  @ApiOperation({ summary: 'Probar comparación de contraseña' })
  @ApiResponse({ status: 200, description: 'Resultado de la comparación' })
  async testPassword(
    @Param('email') email: string,
    @Param('password') password: string,
  ) {
    try {
      const user = await this.dataSource.query(
        'SELECT id, name, email, password_hash FROM users WHERE email = $1',
        [email],
      );

      if (user.length === 0) {
        return {
          status: 'error',
          message: 'Usuario no encontrado',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      const passwordHash = user[0].password_hash;
      const isValid = await bcrypt.compare(password, passwordHash);

      return {
        status: 'ok',
        message: 'Comparación de contraseña completada',
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
        },
        password_test: {
          provided_password: password,
          stored_hash: passwordHash,
          is_valid: isValid,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al probar contraseña',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('fix-password/:email/:newPassword')
  @ApiOperation({ summary: 'Corregir hash de contraseña de un usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  async fixPassword(
    @Param('email') email: string,
    @Param('newPassword') newPassword: string,
  ) {
    try {
      const user = await this.dataSource.query(
        'SELECT id, name, email FROM users WHERE email = $1',
        [email],
      );

      if (user.length === 0) {
        return {
          status: 'error',
          message: 'Usuario no encontrado',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      // Generar nuevo hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Actualizar en la base de datos
      await this.dataSource.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [newPasswordHash, email],
      );

      return {
        status: 'ok',
        message: 'Contraseña actualizada exitosamente',
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
        },
        password_update: {
          new_password: newPassword,
          new_hash: newPasswordHash,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al actualizar contraseña',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('create-admin')
  @ApiOperation({ summary: 'Crear usuario administrador' })
  @ApiResponse({
    status: 201,
    description: 'Usuario admin creado exitosamente',
  })
  async createAdmin(
    @Body() createAdminDto: { name: string; email: string; password: string },
  ) {
    try {
      const { name, email, password } = createAdminDto;

      // Verificar si el usuario ya existe
      const existingUser = await this.dataSource.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );

      if (existingUser.length > 0) {
        return {
          status: 'error',
          message: 'El usuario ya existe',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Crear el usuario admin
      const newUser = await this.dataSource.query(
        `
        INSERT INTO users (id, name, email, password_hash, role, "isBlocked", created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, email, role, "isBlocked", created_at
        `,
        [name, email, passwordHash, 'admin', false],
      );

      return {
        status: 'ok',
        message: 'Usuario administrador creado exitosamente',
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role: newUser[0].role,
          isBlocked: newUser[0].isBlocked,
          created_at: newUser[0].created_at,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al crear usuario administrador',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('user-payment/:email')
  @ApiOperation({ summary: 'Verificar pago y suscripción de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Información de pago y suscripción',
  })
  async getUserPaymentInfo(@Param('email') email: string) {
    try {
      // Buscar el usuario
      const user = await this.dataSource.query(
        'SELECT id, name, email, role, created_at FROM users WHERE email = $1',
        [email],
      );

      if (user.length === 0) {
        return {
          status: 'error',
          message: 'Usuario no encontrado',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      const userId = user[0].id;

      // Buscar pagos del usuario
      const payments = await this.dataSource.query(
        'SELECT id, amount, status, payment_type, currency, stripe_payment_intent_id, created_at FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );

      // Buscar suscripciones del usuario
      const subscriptions = await this.dataSource.query(
        'SELECT id, plan_id, status, start_at, end_at, created_at FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );

      // Buscar planes
      const plans = await this.dataSource.query(
        'SELECT id, name, price, "durationDays" FROM plans',
      );

      return {
        status: 'ok',
        message: 'Información de pago y suscripción obtenida',
        user: user[0],
        payments: payments,
        subscriptions: subscriptions,
        plans: plans,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al obtener información de pago y suscripción',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('subscription-info-test/:email')
  @ApiOperation({
    summary:
      'Obtener información de vigencia del plan (sin autenticación para pruebas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de vigencia del plan obtenida',
  })
  async getSubscriptionInfoTest(@Param('email') email: string) {
    try {
      // Buscar el usuario por email
      const user = await this.dataSource.query(
        'SELECT id, name, email FROM users WHERE email = $1',
        [email],
      );

      if (user.length === 0) {
        return {
          status: 'error',
          message: 'Usuario no encontrado',
          email: email,
          timestamp: new Date().toISOString(),
        };
      }

      const userId = user[0].id;

      // Buscar la suscripción activa del usuario
      const activeSubscription = await this.dataSource.query(
        `
        SELECT 
          s.id,
          s.status,
          s.start_at,
          s.end_at,
          s.created_at,
          p.name as plan_name,
          p.price,
          p.currency,
          p."durationDays"
        FROM subscriptions s
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
        `,
        [userId],
      );

      if (activeSubscription.length === 0) {
        return {
          status: 'error',
          message: 'No se encontró una suscripción activa',
          timestamp: new Date().toISOString(),
        };
      }

      const subscription = activeSubscription[0];

      return {
        status: 'ok',
        message: 'Información de vigencia del plan obtenida',
        subscription: {
          id: subscription.id,
          plan_name: subscription.plan_name,
          price: subscription.price,
          currency: subscription.currency,
          duration_days: subscription.durationDays,
          status: subscription.status,
          start_at: subscription.start_at,
          end_at: subscription.end_at,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al obtener información de vigencia del plan',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('subscription-info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener información de vigencia del plan del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de vigencia del plan obtenida',
  })
  async getSubscriptionInfo(@Request() req: any) {
    try {
      const userId = req.user.id;

      // Buscar la suscripción activa del usuario
      const activeSubscription = await this.dataSource.query(
        `
        SELECT 
          s.id,
          s.status,
          s.start_at,
          s.end_at,
          s.created_at,
          p.name as plan_name,
          p.price,
          p.currency,
          p."durationDays"
        FROM subscriptions s
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
        `,
        [userId],
      );

      if (activeSubscription.length === 0) {
        return {
          status: 'error',
          message: 'No se encontró una suscripción activa',
          timestamp: new Date().toISOString(),
        };
      }

      const subscription = activeSubscription[0];
      const now = new Date();
      const endDate = new Date(subscription.end_at);
      const startDate = new Date(subscription.start_at);

      // Calcular días restantes
      const daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Calcular días transcurridos
      const daysElapsed = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        status: 'ok',
        message: 'Información de vigencia del plan obtenida',
        subscription: {
          id: subscription.id,
          plan_name: subscription.plan_name,
          price: subscription.price,
          currency: subscription.currency,
          duration_days: subscription.durationDays,
          status: subscription.status,
          start_at: subscription.start_at,
          end_at: subscription.end_at,
          days_remaining: daysRemaining,
          days_elapsed: daysElapsed,
          is_active: daysRemaining > 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al obtener información de vigencia del plan',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
