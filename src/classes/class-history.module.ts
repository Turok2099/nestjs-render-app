import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassHistoryController } from './class-history.controller';
import { ClassHistoryService } from './class-history.service';
import { ClassHistory } from './entities/class-history.entity';
import { UsersModule } from '../user/users.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassHistory]),
    UsersModule,
    ClassesModule, 
  ],
  controllers: [ClassHistoryController],
  providers: [ClassHistoryService],
  exports: [ClassHistoryService],
})
export class ClassHistoryModule {}