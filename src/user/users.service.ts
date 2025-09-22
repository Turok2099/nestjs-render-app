import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findMe(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.publicUser(user);
  }

  async findAll(page = 1, limit = 10) {
    const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [items, total] = await this.usersRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return {
      page: Number(page) || 1,
      limit: take,
      total,
      items: items.map(this.publicUser),
    };
  }

  async updateRole(id: string, role: UserRole) {
    await this.ensureExists(id);
    await this.usersRepository.update({ id }, { role });
    const user = await this.usersRepository.findOne({ where: { id } });
    return this.publicUser(user!);
  }

  async updateStatus(id: string, isBlocked: boolean) {
    await this.ensureExists(id);
    await this.usersRepository.update({ id }, { isBlocked });
    const user = await this.usersRepository.findOne({ where: { id } });
    return this.publicUser(user!);
  }

  private async ensureExists(id: string) {
    const exists = await this.usersRepository.exist({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private publicUser = (u: User) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isBlocked: u.isBlocked,
    address: u.address,
    phone: u.phone,
    createdAt: u.createdAt,
  });

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } as any });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(userId, updateUserDto);
    return await this.getProfile(userId);
  }

  async updateUser(
    id: string,
    updateUserDto: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
    }>,
  ) {
    await this.ensureExists(id);
    await this.usersRepository.update({ id }, updateUserDto);
    const user = await this.usersRepository.findOne({ where: { id } });
    return this.publicUser(user!);
  }
}
