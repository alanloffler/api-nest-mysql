import { IsNumber, IsPositive, IsString, IsIn, MinLength } from 'class-validator';

export class CreatePropertyDto {
    @IsString()
    @MinLength(1)
    type: string;

    @IsString()
    @MinLength(7)
    color: string;

    @IsString()
    @MinLength(1)
    business_type: string;

    @IsIn([0, 1])
    is_active: number;

    @IsString()
    @MinLength(1)
    title: string;

    @IsString()
    @MinLength(1)
    short_description: string;

    @IsString()
    @MinLength(1)
    long_description: string;

    @IsNumber()
    @IsPositive()
    price: number;
}
