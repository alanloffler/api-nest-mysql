import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class CreateStateDto {
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsString()
    @MinLength(1)
    state: string;
}
