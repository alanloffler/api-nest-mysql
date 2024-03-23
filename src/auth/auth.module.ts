import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from './constants/jwt.constant';

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
