import { IsNumber, IsPositive, IsString, IsIn, MinLength, Max, IsInt, IsOptional } from 'class-validator';

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
    @Max(1000000000)
    price: number;
    
    @IsString()
    @MinLength(1)
    street: string;
    
    @IsString()
    @MinLength(1)
    city: string;
    
    @IsString()
    @MinLength(1)
    state: string;
    
    @IsString()
    @MinLength(1)
    zip: string

    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;

    @IsInt()
    @IsOptional()
    zoom?: number;

    @IsString()
    @IsOptional()
    key?: string;
}
