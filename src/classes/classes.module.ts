import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { Reservation } from './entities/reservation.entity';
import { ClassesService } from './classes.service';
import { ReservationsService } from './reservations.service';
import { ClassesController } from './classes.controller';
import { ReservationsController } from './reservations.controller';
import { User } from '../user/entities/user.entity';
import { ClassesSeedService } from './seed/classes.seed.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ClassHistory } from './entities/class-history.entity';
import { ReservationsMeController } from './reservations.me.controller';
import { ReservationsUserController } from './reservations.user.controller';


@Module({
  imports: [
  TypeOrmModule.forFeature([Class, Reservation, User, ClassHistory]),
  SubscriptionsModule, 
],
  controllers: [ClassesController, ReservationsController, ReservationsMeController, ReservationsUserController],
  providers: [ClassesService, ReservationsService, ClassesSeedService],
  exports: [ReservationsService, ClassesService],
})
export class ClassesModule {}
