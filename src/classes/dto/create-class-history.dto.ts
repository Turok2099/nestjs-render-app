import { IsDateString, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateClassHistoryDto {
    @IsNotEmpty()
    @IsString()
    class: string;

    @IsDateString()
    date: string;

    @IsInt()
    classId: number;
}