import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    plural: string;

    @IsString()
    @MinLength(7)
    color: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    createdBy: number;
}
