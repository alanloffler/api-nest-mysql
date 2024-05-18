import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CategoriesModule } from './categories/categories.module';
import { CategorySubscriber } from './categories/category.subscriber';
import { FavoritesModule } from './favorites/favorites.module';
import { ImagesModule } from './images/images.module';
import { PropertiesModule } from './properties/properties.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 8889,
            username: 'root',
            password: 'root',
            database: 'api-nest',
            autoLoadEntities: true,
            synchronize: true,
            subscribers: [CategorySubscriber],
        }),
        AuthModule,
        BusinessModule,
        CategoriesModule,
        FavoritesModule,
        ImagesModule,
        PropertiesModule,
        RolesModule,
        SettingsModule,
        UsersModule,
        RolesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
