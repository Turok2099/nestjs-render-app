import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePlanDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(2)
    durationDays: number;
    @IsOptional()
    @IsString()
    description?: string;
}