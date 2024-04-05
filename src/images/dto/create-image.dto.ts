import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateImageDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    name: string;

    @IsInt()
    @IsNotEmpty()
    propertyId: number;

    @IsInt()
    @IsNotEmpty()
    uploaded_by: number;
}
