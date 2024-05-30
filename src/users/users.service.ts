import * as bcryptjs from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { Role } from '../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersConfig } from '../common/config/users.config';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async create(createUserDto: CreateUserDto): Promise<IResponse> {
        const user = this.userRepository.create(createUserDto);

        const userCreated = await this.userRepository.save(user);
        if (!userCreated) throw new HttpException(UsersConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: UsersConfig.created };
    }

    async findOneByEmail(email: string): Promise<User> {
        const userFound = await this.userRepository.findOneBy({ email });
        if (!userFound) throw new HttpException(UsersConfig.userExists, HttpStatus.CONFLICT);

        return userFound;
    }

    async findByEmailWithPassword(email: string): Promise<User> {
        const userFound = await this.userRepository.findOne({
            where: { email: email },
            select: ['id', 'email', 'password', 'role'],
        });
        if (!userFound) throw new HttpException(UsersConfig.notFound, HttpStatus.NOT_FOUND);

        return userFound;
    }

    async findAll(activeUser: IActiveUser): Promise<User[]> {
        if (activeUser.role === Role.ADMIN) {
            const properties = await this.userRepository.find({ withDeleted: true });
            if (!properties) throw new HttpException(UsersConfig.notFoundMany, HttpStatus.NOT_FOUND);
            
            return properties;
        } else {
            const properties = await this.userRepository.find();
            if (!properties) throw new HttpException(UsersConfig.notFoundMany, HttpStatus.NOT_FOUND);
            
            return properties;
        }
    }

    async findOne(id: number): Promise<User> {
        const userFound = await this.userRepository.findOneBy({ id });
        if (!userFound) throw new HttpException(UsersConfig.notFound, HttpStatus.NOT_FOUND);

        return userFound;
    }

    async findOneWithDeleted(id: number): Promise<User> {
        const userDeleted = await this.userRepository.findOne({
            where: { id: id },
            withDeleted: true,
        });
        if (!userDeleted) throw new HttpException(UsersConfig.userNotSoftDeleted, HttpStatus.NOT_FOUND);

        return userDeleted;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<IResponse> {
        await this.findOne(id);
        if (updateUserDto.password) updateUserDto.password = await bcryptjs.hash(updateUserDto.password, 10);

        const userUpdated = await this.userRepository.update(id, { ...updateUserDto });
        if (userUpdated.affected === 0) throw new HttpException(UsersConfig.notUpdated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: UsersConfig.updated };
    }

    async restore(id: number): Promise<IResponse> {
        await this.findOneWithDeleted(id);

        const restoreUser = await this.userRepository.restore({ id });
        if (restoreUser.affected === 0) throw new HttpException(UsersConfig.notRestored, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: UsersConfig.restored };
    }

    async remove(id: number): Promise<IResponse> {
        const userExists = await this.userRepository.findOneBy({ id });
        if (!userExists) {
            const restore = await this.userRepository.restore({ id });
            if (!restore) throw new HttpException(UsersConfig.notFound, HttpStatus.NOT_FOUND);
        }

        const userDeleted = await this.userRepository.delete({ id });
        if (userDeleted.affected === 0) throw new HttpException(UsersConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: UsersConfig.deleted };
    }

    async removeSoft(id: number): Promise<IResponse> {
        await this.findOne(id);
        
        const userSoftRemoved = await this.userRepository.softDelete({ id });
        if (userSoftRemoved.affected === 0) throw new HttpException(UsersConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: UsersConfig.deleted };
    }
}
