import { ClassHistoryResponseDto } from '../../classes/dto/class-history-response.dto';
import { ClassAvailableDto } from '../../classes/dto/classes-available.dto';
import { CommentResponseDto } from '../../comments/dto/comment-response.dto';
import { UserProfileDto } from '../../user/dto/user-profile.dto';

export class DashboardDataDto {
  profile: UserProfileDto;
  comments: CommentResponseDto[];
  availableClasses: ClassAvailableDto[];
  classHistory: ClassHistoryResponseDto[];
}
