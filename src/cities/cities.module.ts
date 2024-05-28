import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { StatesModule } from '../states/states.module';
import { StatesService } from '../states/states.service';

@Module({
    imports: [TypeOrmModule.forFeature([City]), forwardRef(() => StatesModule)],
    controllers: [CitiesController],
    providers: [CitiesService, StatesService],
    exports: [TypeOrmModule, CitiesService],
})
export class CitiesModule {}
