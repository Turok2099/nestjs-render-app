import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'TrainUp Reforma 26' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'México' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  country: string;

  @ApiProperty({ example: 'CDMX' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiProperty({ example: 'Av. Paseo de la Reforma 26, Cuauhtémoc' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 19.429 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: -99.163 })
  @IsLongitude()
  lng: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
