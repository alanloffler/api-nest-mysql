import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { UsersModule } from '../users/users.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { UsersService } from '../users/users.service';

@Module({
    imports: [TypeOrmModule.forFeature([Property]), UsersModule],
    controllers: [PropertiesController],
    providers: [PropertiesService, UsersService],
    exports: [TypeOrmModule, PropertiesService],
})
export class PropertiesModule {}
