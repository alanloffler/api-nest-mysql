import * as bcryptjs from 'bcryptjs';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../common/config/auth.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.findOneByEmail(registerDto.email);
        if (user) throw new HttpException(AuthConfig.userExists, HttpStatus.CONFLICT);

        const passwordHashed = await bcryptjs.hash(registerDto.password, 10);

        return await this.usersService.create({ ...registerDto, password: passwordHashed });
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmailWithPassword(loginDto.email);
        if (!user) throw new HttpException(AuthConfig.emailNotFound, HttpStatus.UNAUTHORIZED);

        const passwordMatch = await bcryptjs.compare(loginDto.password, user.password);
        if (!passwordMatch) throw new HttpException(AuthConfig.incorrectPassword, HttpStatus.UNAUTHORIZED);

        const payload = { id: user.id, email: user.email, role: user.role };
        const token = await this.jwtService.signAsync(payload);

        return { token, email: loginDto.email, role: user.role, userId: user.id };
    }
}
