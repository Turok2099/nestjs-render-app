import { Module } from '@nestjs/common';
import { ExercisesSimpleController } from './exercises-simple.controller';

@Module({
  controllers: [ExercisesSimpleController],
  providers: [],
  exports: [],
})
export class ExercisesSimpleModule {}

