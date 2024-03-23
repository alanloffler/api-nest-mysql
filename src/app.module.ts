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
            port: 3307,
            username: 'user_room202',
            password: 'root',
            database: 'db_room202',
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
