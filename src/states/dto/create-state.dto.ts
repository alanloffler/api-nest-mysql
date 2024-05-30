import { IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateStateDto {
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsString()
    @MinLength(1)
    state: string;
}
