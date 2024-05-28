import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';
import { CitiesModule } from 'src/cities/cities.module';
import { CitiesService } from 'src/cities/cities.service';

@Module({
    imports: [TypeOrmModule.forFeature([State]), CitiesModule],
    controllers: [StatesController],
    providers: [StatesService, CitiesService],
    exports: [TypeOrmModule, StatesService],
})
export class StatesModule {}
