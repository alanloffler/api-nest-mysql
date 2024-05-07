import { PropertiesModule } from 'src/properties/properties.module';
import { UsersModule } from '../users/users.module';
// import { UsersService } from '../users/users.service';
import { Favorite } from './entities/favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Favorite]), UsersModule, PropertiesModule],
    controllers: [FavoritesController],
    providers: [FavoritesService],
})
export class FavoritesModule {}
