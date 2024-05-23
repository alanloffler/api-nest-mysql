import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';

@Module({
    imports: [TypeOrmModule.forFeature([State])],
    controllers: [StatesController],
    providers: [StatesService],
})
export class StatesModule {}
