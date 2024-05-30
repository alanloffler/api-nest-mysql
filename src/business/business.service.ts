import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessConfig } from '../common/config/business.config';
import { CreateBusinessDto } from './dto/create-business.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
    constructor(@InjectRepository(Business) private businessRepository: Repository<Business>) {}

    async create(createBusinessDto: CreateBusinessDto, activeUser: IActiveUser): Promise<IResponse> {
        const newBusiness = this.businessRepository.create({ ...createBusinessDto, createdBy: activeUser.id });
        const businessCreated = await this.businessRepository.save(newBusiness);
        if (!businessCreated) throw new HttpException(BusinessConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: BusinessConfig.created };
    }

    async findAll(): Promise<Business[]> {
        const business = await this.businessRepository.find();
        if (business.length === 0) throw new HttpException(BusinessConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return business;
    }

    async findAllWithDeleted(): Promise<Business[]> {
        const business = await this.businessRepository.find({ withDeleted: true });
        if (business.length === 0) throw new HttpException(BusinessConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return business;
    }

    async findOne(id: number): Promise<Business> {
        const business = await this.businessRepository.findOneBy({ id });
        if (!business) throw new HttpException(BusinessConfig.notFound, HttpStatus.NOT_FOUND);

        return business;
    }

    async findOneWithDeleted(id: number): Promise<Business> {
        const business = await this.businessRepository.findOne({ where: { id: id }, withDeleted: true });
        if (!business) throw new HttpException(BusinessConfig.notFound, HttpStatus.NOT_FOUND);

        return business;
    }

    async update(id: number, updateBusinessDto: UpdateBusinessDto, activeUser: IActiveUser): Promise<IResponse> {
        await this.findOne(id);
        const businessUpdated = await this.businessRepository.update(id, {
            ...updateBusinessDto,
            updatedBy: activeUser.id,
        });
        if (businessUpdated.affected === 0) throw new HttpException(BusinessConfig.notUpdated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: BusinessConfig.updated };
    }

    async remove(id: number): Promise<IResponse> {
        const businessFound = await this.findOneWithDeleted(id);
        if (businessFound.deletedAt !== null) {
            const businessRestored = await this.businessRepository.restore({ id: id });
            if (businessRestored.affected === 0) throw new HttpException(BusinessConfig.notDeletedRestored, HttpStatus.BAD_REQUEST);
        }

        const businessDeleted = await this.businessRepository.delete(id);
        if (businessDeleted.affected === 0) throw new HttpException(BusinessConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: BusinessConfig.deleted };
    }

    async removeSoft(id: number, activeUser: IActiveUser): Promise<IResponse> {
        await this.findOne(id);

        const businessUpdated = await this.businessRepository.update(id, { updatedBy: activeUser.id });
        if (businessUpdated.affected === 0) throw new HttpException(BusinessConfig.notUpdated, HttpStatus.BAD_REQUEST);

        const businessDeleted = await this.businessRepository.softDelete({ id: id });
        if (businessDeleted.affected === 0) throw new HttpException(BusinessConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: BusinessConfig.deleted };
    }

    async restore(id: number, activeUser: IActiveUser): Promise<IResponse> {
        const softDeletedBusiness = await this.findOneWithDeleted(id);
        if (softDeletedBusiness) {
            if (softDeletedBusiness.deletedAt === null) {
                throw new HttpException(BusinessConfig.notSoftDeleted, HttpStatus.BAD_REQUEST);
            } else {
                const businessUpdated = await this.businessRepository.update(id, { updatedBy: activeUser.id });
                if (businessUpdated.affected === 0) throw new HttpException(BusinessConfig.notUpdated, HttpStatus.BAD_REQUEST);

                const businessRestored = await this.businessRepository.restore({ id: id });
                if (businessRestored.affected === 0) throw new HttpException(BusinessConfig.notRestored, HttpStatus.BAD_REQUEST);

                return { statusCode: HttpStatus.OK, message: BusinessConfig.restored };
            }
        } else {
            throw new HttpException(BusinessConfig.notFound, HttpStatus.NOT_FOUND);
        }
    }
}
