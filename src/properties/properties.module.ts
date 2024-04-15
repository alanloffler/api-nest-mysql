import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CategoriesService } from '../categories/categories.service';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ImagesModule } from '../images/images.module';
import { ImagesService } from 'src/images/images.service';

@Module({
    imports: [TypeOrmModule.forFeature([Property]), UsersModule, CategoriesModule, forwardRef(() => ImagesModule)],
    controllers: [PropertiesController],
    providers: [PropertiesService, UsersService, CategoriesService, ImagesService],
    exports: [TypeOrmModule, PropertiesService],
})
export class PropertiesModule {}
