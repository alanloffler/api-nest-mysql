import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CategoriesService } from '../categories/categories.service';
import { FavoritesModule } from '../favorites/favorites.module';
import { ImagesModule } from '../images/images.module';
import { ImagesService } from '../images/images.service';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { StatesModule } from '../states/states.module';
import { StatesService } from '../states/states.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Property]),
        UsersModule,
        CategoriesModule,
        StatesModule,
        forwardRef(() => ImagesModule),
        forwardRef(() => FavoritesModule),
    ],
    controllers: [PropertiesController],
    providers: [PropertiesService, UsersService, CategoriesService, ImagesService, StatesService],
    exports: [TypeOrmModule, PropertiesService],
})
export class PropertiesModule {}
