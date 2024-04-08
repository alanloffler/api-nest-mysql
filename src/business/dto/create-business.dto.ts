import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBusinessDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    plural: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    createdBy: number;
}
