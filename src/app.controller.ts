import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Servidor funcionando correctamente',
    };
  }

  @Get('db-test')
  async testDatabaseConnection() {
    try {
      // Verificar si la conexión está activa
      if (!this.dataSource.isInitialized) {
        throw new Error('Base de datos no inicializada');
      }

      // Ejecutar una consulta simple para probar la conexión
      const result = await this.dataSource.query('SELECT NOW() as current_time, version() as db_version');
      
      // Obtener información sobre las tablas
      const tablesResult = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      return {
        success: true,
        message: 'Conexión a la base de datos exitosa',
        data: {
          currentTime: result[0].current_time,
          dbVersion: result[0].db_version,
          tables: tablesResult.map(row => row.table_name),
          environment: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al conectar con la base de datos',
        error: error.message,
        data: {
          environment: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
