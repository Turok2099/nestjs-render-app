import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UsersService } from '../user/users.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userService: UsersService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    await this.userService.findById(userId); // Validar que el usuario existe
    
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
      date: createCommentDto.date || new Date().toISOString().split('T')[0],
    });
    
    return await this.commentRepository.save(comment);
  }

  async findByUser(userId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      rating: comment.rating,
      date: comment.date,
      user: {
        id: comment.user.id,
        name: comment.user.name,
      },
    }));
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      rating: comment.rating,
      date: comment.date,
      user: {
        id: comment.user.id,
        name: comment.user.name,
      },
    }));
  }
}