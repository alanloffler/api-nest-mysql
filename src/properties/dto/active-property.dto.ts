import { IsIn } from 'class-validator';

export class ActivePropertyDto {
    @IsIn([0, 1])
    is_active: number;
}