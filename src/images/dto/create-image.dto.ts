import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
