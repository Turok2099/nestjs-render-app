import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo comentario' })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  async create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return await this.commentService.create(req.user.userId, createCommentDto);
  }

  @Get('my-comments')
  @ApiOperation({ summary: 'Obtener comentarios del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Comentarios obtenidos exitosamente' })
  async getMyComments(@Request() req): Promise<CommentResponseDto[]> {
    return await this.commentService.findByUser(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios obtenida exitosamente' })
  async findAll(): Promise<CommentResponseDto[]> {
    return await this.commentService.findAll();
  }
}