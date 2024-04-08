import { UnauthorizedException, Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.findOneByEmail(registerDto.email);

        if (user) throw new BadRequestException('User already exists');

        const passwordHashed = await bcryptjs.hash(registerDto.password, 10);

        return await this.usersService.create({ ...registerDto, password: passwordHashed });
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmailWithPassword(loginDto.email);
        if (!user) throw new UnauthorizedException('E-mail not found');

        const passwordMatch = await bcryptjs.compare(loginDto.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Password incorrect');

        const payload = { id: user.id, email: user.email, role: user.role };
        const token = await this.jwtService.signAsync(payload);

        return { token, email: loginDto.email, role: user.role, userId: user.id };
    }
}
