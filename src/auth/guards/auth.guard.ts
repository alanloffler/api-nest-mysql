import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT } from '../constants/jwt.constant';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const tokenExists = this.getTokenFromHeader(request);
        if (!tokenExists) throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);

        try {
            const payload = await this.jwtService.verifyAsync(tokenExists, { secret: JWT.secret });
            request.user = payload;
        } catch {
            throw new HttpException('Token not valid', HttpStatus.UNAUTHORIZED);
        }

        return true;
    }

    private getTokenFromHeader(request: Request): string | undefined {
        const header = request.headers.authorization?.split(' ') ?? [];
        return header[0] === 'Bearer' ? header[1] : undefined;
    }
}
