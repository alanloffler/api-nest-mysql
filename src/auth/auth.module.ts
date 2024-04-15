import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT } from './constants/jwt.constant';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: JWT.secret,
            signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
