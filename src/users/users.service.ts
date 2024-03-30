import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async create(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }

    async findOneByEmail(email: string) {
        return this.userRepository.findOneBy({ email });
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: { email: email },
            select: ['id', 'email', 'password', 'role'],
        });
    }

    async findAll() {
        return await this.userRepository.find();
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) throw new BadRequestException('User not found');
        this.validateSameUser(user, activeUser);

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto, activeUser: IActiveUser) {
        await this.findOne(id, activeUser);
        if (updateUserDto.password) updateUserDto.password = await bcryptjs.hash(updateUserDto.password, 10);

        return await this.userRepository.update(id, { ...updateUserDto });
    }

    async restore(id: number) {
        return await this.userRepository.restore({ id });
    }

    async remove(id: number) {
        const userExists: User = await this.userRepository.findOneBy({ id });
        if (!userExists) {
            const restore = await this.userRepository.restore({ id });
            if (!restore) throw new BadRequestException('User not found');
        }

        return await this.userRepository.delete({ id });
    }

    async removeSoft(id: number, activeUser: IActiveUser) {
        await this.findOne(id, activeUser);

        return await this.userRepository.softDelete({ id });
    }

    private validateSameUser(user: User, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && user.id !== activeUser.id)
            throw new UnauthorizedException('Ownership is required');
    }
}
