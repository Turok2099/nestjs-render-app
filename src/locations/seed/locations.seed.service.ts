import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsSeedService {
  private readonly logger = new Logger(LocationsSeedService.name);

  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  async run() {
    const data: Array<Partial<Location>> = [
      // ARGENTINA
      {
        name: 'TrainUp Palermo',
        country: 'Argentina',
        city: 'Buenos Aires',
        address: 'Av. Santa Fe 3253, Palermo',
        lat: (-34.588500).toFixed(6),
        lng: (-58.410700).toFixed(6),
      },
      {
        name: 'TrainUp Microcentro',
        country: 'Argentina',
        city: 'Buenos Aires',
        address: 'Av. Pres. Roque Sáenz Peña 615, Microcentro',
        lat: (-34.603700).toFixed(6),
        lng: (-58.381600).toFixed(6),
      },
      {
        name: 'TrainUp Córdoba Centro',
        country: 'Argentina',
        city: 'Córdoba',
        address: 'Av. Colón 345, Centro',
        lat: (-31.420100).toFixed(6),
        lng: (-64.188800).toFixed(6),
      },

      // COLOMBIA
      {
        name: 'TrainUp Chapinero',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Cra. 13 #55-10, Chapinero',
        lat: (4.648600).toFixed(6),
        lng: (-74.062900).toFixed(6),
      },
      {
        name: 'TrainUp La Candelaria',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 10 #6-20, La Candelaria',
        lat: (4.596400).toFixed(6),
        lng: (-74.073000).toFixed(6),
      },
      {
        name: 'TrainUp El Poblado',
        country: 'Colombia',
        city: 'Medellín',
        address: 'Cra. 43A #6S-15, El Poblado',
        lat: (6.208800).toFixed(6),
        lng: (-75.567000).toFixed(6),
      },

      // MÉXICO
      {
        name: 'TrainUp Reforma 26',
        country: 'México',
        city: 'CDMX',
        address: 'Av. Paseo de la Reforma 26, Cuauhtémoc',
        lat: (19.429000).toFixed(6),
        lng: (-99.163000).toFixed(6),
      },
      {
        name: 'TrainUp Polanco',
        country: 'México',
        city: 'CDMX',
        address: 'Av. Presidente Masaryk 123, Polanco',
        lat: (19.432600).toFixed(6),
        lng: (-99.200500).toFixed(6),
      },
      {
        name: 'TrainUp Guadalajara Centro',
        country: 'México',
        city: 'Guadalajara',
        address: 'Av. Juárez 150, Centro',
        lat: (20.676700).toFixed(6),
        lng: (-103.347600).toFixed(6),
      },
    ];

    for (const item of data) {
      const exists = await this.repo.findOne({
        where: {
          name: item.name!,
          city: item.city!,
          country: item.country!,
        },
      });
      if (!exists) {
        await this.repo.save(this.repo.create({ ...item, isActive: true }));
        this.logger.log(`+ Seeded: ${item.name} (${item.city}, ${item.country})`);
      } else {
        this.logger.log(`= Skipped (exists): ${item.name}`);
      }
    }
  }
}
