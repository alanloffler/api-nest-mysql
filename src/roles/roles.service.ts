import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { Role } from './entities/role.entity';
import { RolesConfig } from '../common/config/roles.config';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

    async create(createRoleDto: CreateRoleDto): Promise<IResponse> {
        const createRole = this.roleRepository.create(createRoleDto);
        const saveRole = await this.roleRepository.save(createRole);
        if (!saveRole) throw new HttpException(RolesConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: RolesConfig.created };
    }

    async findAll(): Promise<Role[] | IResponse> {
        const roles = await this.roleRepository.find({ order: { title: 'ASC' } });
        if (!roles) throw new HttpException(RolesConfig.notFoundMany, HttpStatus.NOT_FOUND);
        if (roles.length < 1) return { statusCode: HttpStatus.NO_CONTENT, message: RolesConfig.notFoundOnDB };

        return roles;
    }

    async findOne(id: number): Promise<Role> {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) throw new HttpException(RolesConfig.notFound, HttpStatus.NOT_FOUND);

        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<IResponse> {
        await this.findOne(id);
        const updateRole = await this.roleRepository.update(id, updateRoleDto);
        if (updateRole.affected === 0) throw new HttpException(RolesConfig.notUpdated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: RolesConfig.updated };
    }

    async remove(id: number): Promise<IResponse> {
        const deleteRole = await this.roleRepository.delete(id);
        if (!deleteRole) throw new HttpException(RolesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: RolesConfig.deleted };
    }
}
