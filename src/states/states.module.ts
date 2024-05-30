import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesModule } from '../cities/cities.module';
import { CitiesService } from '../cities/cities.service';
import { State } from './entities/state.entity';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';

@Module({
    imports: [TypeOrmModule.forFeature([State]), forwardRef(() => CitiesModule)],
    controllers: [StatesController],
    providers: [StatesService, CitiesService],
    exports: [TypeOrmModule, StatesService],
})
export class StatesModule {}
