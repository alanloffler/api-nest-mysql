import { IsNumber, IsPositive, IsString, IsIn, MinLength, Max, IsInt, IsOptional } from 'class-validator';
import { State } from '../../states/entities/state.entity';
import { City } from '../../cities/entities/city.entity';

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
    city: City;
    
    @IsInt()
    @IsPositive()
    state: State;
    
    @IsString()
    @MinLength(1)
    zip: string

    @IsOptional()
    lat?: number;

    @IsOptional()
    lng?: number;

    @IsInt()
    @IsOptional()
    zoom?: number;

    @IsString()
    @IsOptional()
    key?: string;
}