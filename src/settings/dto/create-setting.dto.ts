import { IsString, MinLength } from "class-validator";

export class CreateSettingDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    @MinLength(1)
    value: string;
}
