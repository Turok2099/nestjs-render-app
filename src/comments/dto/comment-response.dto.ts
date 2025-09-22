export class CommentResponseDto {
  id: string;
  text: string;
  rating: number;
  date: string;
  user: {
    id: string;
    name: string;
  };
}