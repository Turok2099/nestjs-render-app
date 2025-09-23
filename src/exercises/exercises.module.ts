import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Exercise } from './entities/exercise.entity';
import { ExercisesService } from './exercises.service';
import { AdminExercisesController } from './admin-exercises.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise]),
    CloudinaryModule,
  ],
  controllers: [AdminExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}