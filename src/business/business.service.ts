import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
    constructor(@InjectRepository(Business) private businessRepository: Repository<Business>) {}

    async create(createBusinessDto: CreateBusinessDto, activeUser: IActiveUser): Promise<IResponse | HttpException> {
        const newBusiness = this.businessRepository.create({ ...createBusinessDto, createdBy: activeUser.id });
        const businessCreated = await this.businessRepository.save(newBusiness);
        if (!businessCreated) throw new HttpException('Business not created', HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: 'Business created' };
    }

    async findAll(): Promise<Business[]> {
        const business = await this.businessRepository.find();
        if (business.length === 0) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        
        return business;
    }

    async findAllWithDeleted(): Promise<Business[]> {
        const business = await this.businessRepository.find({ withDeleted: true });
        if (business.length === 0) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        
        return business;
    }

    async findOne(id: number): Promise<Business> {
        const business = await this.businessRepository.findOneBy({ id });
        if (!business) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        
        return business;
    }

    async findOneWithDeleted(id: number): Promise<Business> {
        const business = await this.businessRepository.findOne({ where: { id: id }, withDeleted: true });
        if (!business) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        
        return business;
    }

    async update(id: number, updateBusinessDto: UpdateBusinessDto, activeUser: IActiveUser): Promise<HttpException> {
        await this.findOne(id);
        const businessUpdated = await this.businessRepository.update(id, {
            ...updateBusinessDto,
            updatedBy: activeUser.id,
        });
        if (businessUpdated.affected === 0) {
            throw new HttpException('Business not updated', HttpStatus.BAD_REQUEST);
        } else {
            return new HttpException('Business updated', HttpStatus.OK);
        }
    }

    async remove(id: number): Promise<IResponse | HttpException> {
        const businessFound = await this.findOneWithDeleted(id);
        if (businessFound.deletedAt !== null) {
            const businessRestored = await this.businessRepository.restore({ id: id });
            if (businessRestored.affected === 0) throw new HttpException('Delete business failed: Business not restored', HttpStatus.BAD_REQUEST);
        }
        
        const businessDeleted = await this.businessRepository.delete(id);
        if (businessDeleted.affected === 0) throw new HttpException('Business not deleted', HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: 'Business deleted' };
    }

    async removeSoft(id: number, activeUser: IActiveUser): Promise<IResponse | HttpException> {
        await this.findOne(id);
        
        const businessUpdated = await this.businessRepository.update(id, { updatedBy: activeUser.id });
        if (businessUpdated.affected === 0) throw new HttpException('Business not updated', HttpStatus.BAD_REQUEST);
        
        const businessDeleted = await this.businessRepository.softDelete({ id: id });
        if (businessDeleted.affected === 0) throw new HttpException('Business not deleted', HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: 'Business deleted'};
    }

    async restore(id: number, activeUser: IActiveUser): Promise<IResponse | HttpException> {
        const softDeletedBusiness = await this.findOneWithDeleted(id);
        if (softDeletedBusiness) {
            if (softDeletedBusiness.deletedAt === null) {
                throw new HttpException('Business is not soft deleted', HttpStatus.CONFLICT);
            } else {
                const businessUpdated = await this.businessRepository.update(id, { updatedBy: activeUser.id });
                if (businessUpdated.affected === 0) throw new HttpException('Business not updated', HttpStatus.BAD_REQUEST);
                
                const businessRestored = await this.businessRepository.restore({ id: id });
                if (businessRestored.affected === 0) throw new HttpException('Business not restored', HttpStatus.NOT_MODIFIED);
                
                return { statusCode: HttpStatus.OK, message: 'Business restored' };
            }
        } else {
            throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        }
    }
}
