import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ImagesModule } from './images/images.module';
import { PropertiesModule } from './properties/properties.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { StatesModule } from './states/states.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            autoLoadEntities: true,
            synchronize: true,
            ssl: process.env.MYSQL_SSL === 'true',
            extra: {
                ssl:
                    process.env.MYSQL_SSL === 'true'
                        ? {
                              rejectUnauthorized: false,
                          }
                        : null,
            },
        }),
        AuthModule,
        BusinessModule,
        CategoriesModule,
        CitiesModule,
        FavoritesModule,
        ImagesModule,
        PropertiesModule,
        RolesModule,
        RolesModule,
        SettingsModule,
        StatesModule,
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
