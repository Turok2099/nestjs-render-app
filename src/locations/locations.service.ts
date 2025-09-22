import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto, UpdateLocationDto } from './dto/create-location.dto';

type WithLinks = Location & { embedUrl: string; mapUrl: string };

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  async findAll(): Promise<WithLinks[]> {
    const rows = await this.repo.find({
      where: { isActive: true } as FindOptionsWhere<Location>,
    });
    return rows.map((l) => this.withLinks(l));
  }

  async findByCountry(country: string): Promise<WithLinks[]> {
    const rows = await this.repo.find({
      where: { isActive: true, country },
    });
    return rows.map((l) => this.withLinks(l));
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateLocationDto) {
    const entity = this.repo.create({
      name: dto.name,
      country: dto.country,
      city: dto.city,
      address: dto.address,
      lat: String(dto.lat),
      lng: String(dto.lng),
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateLocationDto) {
    const curr = await this.findOne(id);
    if (!curr) throw new BadRequestException('Location not found');

    const patch: Partial<Location> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.country !== undefined) patch.country = dto.country;
    if (dto.city !== undefined) patch.city = dto.city;
    if (dto.address !== undefined) patch.address = dto.address;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.lat !== undefined) patch.lat = String(dto.lat);
    if (dto.lng !== undefined) patch.lng = String(dto.lng);

    const merged = this.repo.merge(curr, patch);
    return this.repo.save(merged);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }

  async nearest(lat: number, lng: number) {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new BadRequestException('lat/lng inválidos');
    }
    const locations = await this.repo.find({ where: { isActive: true } });
    if (!locations.length) return null;

    let best: Location | null = null;
    let bestKm = Infinity;

    for (const loc of locations) {
      const d = this.haversineKm(
        lat,
        lng,
        parseFloat(loc.lat),
        parseFloat(loc.lng),
      );
      if (d < bestKm) {
        best = loc;
        bestKm = d;
      }
    }
    if (!best) return null;
    return {
      ...this.withLinks(best),
      distanceKm: Number(bestKm.toFixed(2)),
    };
  }

  async directions(id: string, originLat: number, originLng: number) {
    if (Number.isNaN(originLat) || Number.isNaN(originLng)) {
      throw new BadRequestException('lat/lng inválidos');
    }
    const dest = await this.findOne(id);
    if (!dest) throw new BadRequestException('Location not found');

    const destLat = parseFloat(dest.lat);
    const destLng = parseFloat(dest.lng);

    const directionsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${originLat},${originLng}` +
      `&destination=${destLat},${destLng}` +
      `&travelmode=driving`;

    return {
      ...this.withLinks(dest),
      distanceKm: Number(
        this.haversineKm(originLat, originLng, destLat, destLng).toFixed(2),
      ),
      directionsUrl,
    };
  }

  // Helpers
  private withLinks(l: Location): WithLinks {
    return {
      ...l,
      embedUrl: `https://maps.google.com/maps?q=${l.lat},${l.lng}&z=15&output=embed`,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${l.name} ${l.address} ${l.city} ${l.country}`,
      )}&query_place_id=`,
    } as WithLinks;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
}
