import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectRepository(Property) private propertyRepository: Repository<Property>,
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async create(createPropertyDto: CreatePropertyDto) {
        const user = await this.userRepository.findOneBy({ id: createPropertyDto.created_by });
        if(!user) throw new BadRequestException('User not found');
        return await this.propertyRepository.save({...createPropertyDto, created_by: user});
    }

    async findAll() {
        return await this.propertyRepository.find();
    }

    async findOne(id: number) {
        return await this.propertyRepository.findOneBy({ id });
    }

    async update(id: number, updatePropertyDto: UpdatePropertyDto) {
        // TODO
        // return await this.propertyRepository.update(id, updatePropertyDto);
    }

    async remove(id: number) {
        return await this.propertyRepository.delete({ id });
    }

}
