import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Favorite]), UsersModule, PropertiesModule],
    controllers: [FavoritesController],
    providers: [FavoritesService],
})
export class FavoritesModule {}
