import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import {
  CreateLocationDto,
  UpdateLocationDto,
} from './dto/create-location.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-country')
  @ApiQuery({ name: 'country', required: true, type: String, example: 'México' })
  byCountry(@Query('country') country: string) {
    return this.service.findByCountry(country);
  }

  @Get('nearest')
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  nearest(@Query('lat') latRaw: string, @Query('lng') lngRaw: string) {
    return this.service.nearest(Number(latRaw), Number(lngRaw));
  }

  @Get(':id/directions')
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  directions(
    @Param('id') id: string,
    @Query('lat') latRaw: string,
    @Query('lng') lngRaw: string,
  ) {
    return this.service.directions(id, Number(latRaw), Number(lngRaw));
  }

  // (Proteger con guard de admin)
  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
