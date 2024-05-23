import { IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCityDto {
    @Transform(({ value }) => value.trim())
    @Transform(({ value }) => value.toLowerCase())
    @IsString()
    @MinLength(1)
    city: string;

    @Transform(({ value }) => value.trim())
    @Transform(({ value }) => value.toLowerCase())
    @IsString()
    @MinLength(1)
    state: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1)
    zip: string;
}
