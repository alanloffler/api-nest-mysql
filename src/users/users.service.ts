import * as bcryptjs from 'bcryptjs';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async create(createUserDto: CreateUserDto) {
        const user = this.userRepository.create(createUserDto);

        const userCreated = await this.userRepository.save(user);
        if (!userCreated) throw new HttpException('User not created', HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: 'User created' };
    }

    async findOneByEmail(email: string) {
        return await this.userRepository.findOneBy({ email });
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: { email: email },
            select: ['id', 'email', 'password', 'role'],
        });
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN) return await this.userRepository.find({ withDeleted: true });

        return await this.userRepository.find();
    }

    async findOne(id: number) {
        const userFound = await this.userRepository.findOneBy({ id });
        if (!userFound) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        return userFound;
    }

    async findOneWithDeleted(id: number) {
        const userDeleted = await this.userRepository.findOne({
            where: { id: id },
            withDeleted: true,
        });
        if (!userDeleted) throw new HttpException('User is not soft deleted', HttpStatus.NOT_FOUND);

        return userDeleted;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        await this.findOne(id);
        if (updateUserDto.password) updateUserDto.password = await bcryptjs.hash(updateUserDto.password, 10);

        const userUpdated = await this.userRepository.update(id, { ...updateUserDto });
        if (userUpdated.affected === 0) throw new HttpException('User not updated', HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: 'User updated' };
    }

    async restore(id: number) {
        await this.findOneWithDeleted(id);

        const restoreUser = await this.userRepository.restore({ id });
        if (restoreUser.affected === 0) throw new HttpException('User not restored', HttpStatus.NOT_MODIFIED);

        return { statusCode: HttpStatus.OK, message: 'User restored' };
    }

    async remove(id: number) {
        const userExists = await this.userRepository.findOneBy({ id });
        if (!userExists) {
            const restore = await this.userRepository.restore({ id });
            if (!restore) throw new BadRequestException('User not found');
        }

        const userDeleted = await this.userRepository.delete({ id });
        if (userDeleted.affected === 0) throw new HttpException('User not deleted', HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: 'User deleted' };
    }

    async removeSoft(id: number) {
        await this.findOne(id);
        const userSoftRemoved = await this.userRepository.softDelete({ id });
        if (userSoftRemoved.affected === 0) throw new HttpException('User not deleted', HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: 'User deleted' };
    }
}
