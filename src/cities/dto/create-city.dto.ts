import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { State } from 'src/states/entities/state.entity';

export class CreateCityDto {
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsString()
    @MinLength(1)
    city: string;

    @IsInt()
    @IsPositive()
    state: State;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1)
    zip: string;
}
