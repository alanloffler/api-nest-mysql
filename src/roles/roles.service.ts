import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { Role } from './entities/role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

    async create(createRoleDto: CreateRoleDto): Promise<IResponse | HttpException> {
        const createRole = this.roleRepository.create(createRoleDto);
        const saveRole = await this.roleRepository.save(createRole);
        if (!saveRole) throw new HttpException('Role not created', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Role created' };
    }

    async findAll(): Promise<Role[] | IResponse | HttpException> {
        const roles = await this.roleRepository.find({ order: { title: 'ASC' } });
        if (!roles) throw new HttpException('Roles not found', HttpStatus.BAD_REQUEST);
        if (roles.length < 1) return { statusCode: HttpStatus.NO_CONTENT, message: 'No roles on database' };
        return roles;
    }

    async findOne(id: number): Promise<Role | HttpException> {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<IResponse | HttpException> {
        await this.findOne(id);
        const updateRole = await this.roleRepository.update(id, updateRoleDto);
        if (updateRole.affected === 0) throw new HttpException('Role not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Role updated' };
    }

    async remove(id: number): Promise<IResponse | HttpException> {
        const deleteRole = await this.roleRepository.delete(id);
        if (!deleteRole) throw new HttpException('Role not deleted', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Role deleted' };
    }
}
