import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActivePropertyDto } from './dto/active-property.dto';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectRepository(Property) private propertyRepository: Repository<Property>,
        private readonly usersService: UsersService,
    ) {}

    async create(createPropertyDto: CreatePropertyDto, activeUser: IActiveUser) {
        const user = await this.usersService.findOne(activeUser.id, activeUser);
        if (!user) throw new BadRequestException('User not found');

        return await this.propertyRepository.save({ ...createPropertyDto, created_by: activeUser.id });
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN) return await this.propertyRepository.find();

        return await this.propertyRepository.find({ where: { created_by: activeUser.id } });
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.findOneBy({ id });
    }

    async update(id: number, updatePropertyDto: UpdatePropertyDto, @ActiveUser() activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.update(id, { ...updatePropertyDto });
    }

    async updateActive(id: number, activePropertyDto: ActivePropertyDto, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.update(id, { is_active: activePropertyDto.is_active });
    }

    async removeSoft(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.softDelete({ id });
    }

    async restore(id: number) {
        return await this.propertyRepository.restore({ id });
    }

    async remove(id: number) {
        const property = await this.propertyRepository.findOneBy({ id });
        if (!property) {
            const restore = await this.propertyRepository.restore({ id });
            if (!restore) throw new BadRequestException('Property not found');
        }

        return await this.propertyRepository.delete({ id });
    }

    private async validateProperty(id: number) {
        const property = await this.propertyRepository.findOneBy({ id });
        if (!property) throw new BadRequestException('Property not found');
        return property;
    }

    private validateSameUser(property: Property, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && property.created_by !== activeUser.id)
            throw new UnauthorizedException('Ownership is required');
    }
}
