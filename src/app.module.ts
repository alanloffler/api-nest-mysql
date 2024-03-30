import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';

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
        }),
        UsersModule,
        PropertiesModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
