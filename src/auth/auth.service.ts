import { UnauthorizedException, Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.findOneByEmail(registerDto.email);

        if (user) throw new BadRequestException('User already exists');

        const passwordHashed = await bcryptjs.hash(registerDto.password, 10);
        
        return await this.usersService.create({...registerDto, password: passwordHashed});
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findOneByEmail(loginDto.email);
        if(!user) throw new UnauthorizedException('E-mail not found');

        const passwordMatch = await bcryptjs.compare(loginDto.password, user.password);
        if(!passwordMatch) throw new UnauthorizedException('Password incorrect');

        const payload = { email: user.email };
        const token = await this.jwtService.signAsync(payload);

        return { token, email: loginDto.email};
    }
}
