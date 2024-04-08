import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ImagesModule } from './images/images.module';
import { PropertiesModule } from './properties/properties.module';
import { UsersModule } from './users/users.module';
import { CategorySubscriber } from './categories/category.subscriber';

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
        CategoriesModule,
        ImagesModule,
        PropertiesModule,
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
