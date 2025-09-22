import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationsSeedService } from './seed/locations.seed.service'; 

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationsController],
  providers: [
    LocationsService,
    LocationsSeedService,
  ],
  exports: [
    LocationsService,
    LocationsSeedService,
  ],
})
export class LocationsModule {}
