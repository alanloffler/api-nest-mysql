import * as fs from 'node:fs/promises';
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { Image } from './entities/image.entity';
import { ImagesConfig } from '../common/config/images.config';
import { PropertiesService } from '../properties/properties.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ImagesService {
    constructor(
        @Inject(forwardRef(() => PropertiesService)) private readonly propertiesService: PropertiesService,
        @InjectRepository(Image) private imageRepository: Repository<Image>,
    ) {}

    async create(createImageDto: CreateImageDto, activeUser: IActiveUser): Promise<IResponse> {
        const propertyFound = await this.propertiesService.findOne(createImageDto.propertyId, activeUser);
        this.propertiesService.validateSameUser(propertyFound, activeUser);

        const imageCreated = await this.imageRepository.save(createImageDto);
        if (!imageCreated) throw new HttpException(ImagesConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: ImagesConfig.created };
    }

    async findAll(activeUser: IActiveUser):Promise<Image[]> {
        if (activeUser.role === Role.ADMIN) {
            const images = await this.imageRepository.find();
            if (!images) throw new HttpException(ImagesConfig.notFoundMany, HttpStatus.NOT_FOUND);
            
            return images;
        } else {
            const images = await this.imageRepository.find({ where: { uploaded_by: activeUser.id } });
            if (!images) throw new HttpException(ImagesConfig.notFoundMany, HttpStatus.NOT_FOUND);
            
            return images;
        }
    }

    async findAllByProperty(id: number, activeUser: IActiveUser): Promise<Image[]> {
        const propertyFound = await this.propertiesService.findOne(id, activeUser);
        if (!propertyFound) throw new HttpException(ImagesConfig.notFoundMany, HttpStatus.NOT_FOUND);
        
        return await this.imageRepository.find({ where: { propertyId: id } });
    }

    async findAllByPropertyWithDeleted(id: number, activeUser: IActiveUser): Promise<Image[]> {
        const propertyFound = await this.propertiesService.findOne(id, activeUser);
        if (!propertyFound) throw new HttpException(ImagesConfig.notFoundMany, HttpStatus.NOT_FOUND);
        
        return await this.imageRepository.find({ where: { propertyId: id }, withDeleted: true });
    }

    async findOne(id: number, activeUser: IActiveUser): Promise<Image> {
        const image = await this.imageRepository.findOneBy({ id });
        if (!image) throw new HttpException(ImagesConfig.notFound, HttpStatus.NOT_FOUND);
        this.validateSameUser(image, activeUser);

        return image;
    }

    async remove(id: number): Promise<IResponse> {
        const imageFound = await this.imageRepository.findOne({ where: { id }, withDeleted: true });
        if (!imageFound) throw new HttpException(ImagesConfig.notFound, HttpStatus.NOT_FOUND);

        try {
            await fs.unlink(`${ImagesConfig.destination}/${imageFound.name}`);
        } catch (error) {
            throw new HttpException(ImagesConfig.notUnlinked, HttpStatus.BAD_REQUEST);
        }

        const imageDeleted = await this.imageRepository.delete({ id });
        if (imageDeleted.affected === 0) throw new HttpException(ImagesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: ImagesConfig.deleted };
    }

    async removeSoft(id: number, activeUser: IActiveUser): Promise<IResponse> {
        const imageFound = await this.imageRepository.findOneBy({ id });
        if (!imageFound) throw new HttpException(ImagesConfig.notFound, HttpStatus.NOT_FOUND);
        this.validateSameUser(imageFound, activeUser);

        const deleted = await this.imageRepository.softDelete({ id });
        if (deleted.affected === 0) throw new HttpException(ImagesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: ImagesConfig.deleted };
    }
    
    async removeSoftMany(id: number, activeUser: IActiveUser): Promise<IResponse> {
        const propertyFound = await this.propertiesService.findOne(id, activeUser);

        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.removeSoft(image.id, activeUser)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { statusCode: HttpStatus.OK, message: ImagesConfig.deletedMany };
            } else {
                throw new HttpException(ImagesConfig.notDeletedMany, HttpStatus.BAD_REQUEST);
            }
        } else {
            return { statusCode: HttpStatus.OK, message: ImagesConfig.notFoundToDelete };
        }
    }

    async removeMany(id: number): Promise<IResponse> {
        const propertyFound = await this.propertiesService.findOneWithDeleted(id);

        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.remove(image.id)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { statusCode: HttpStatus.OK, message: ImagesConfig.deletedMany };
            } else {
                throw new HttpException(ImagesConfig.notDeletedMany, HttpStatus.BAD_REQUEST);
            }
        } else {
            return { statusCode: HttpStatus.OK, message: ImagesConfig.notFoundToDelete };
        }
    }
    // ADMIN ACTION ONLY
    async restore(id: number): Promise<IResponse> {
        const restoreImage = await this.imageRepository.restore({ id });
        if (restoreImage.affected === 0) throw new HttpException(ImagesConfig.notRestored, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: ImagesConfig.restored };
    }
    // ADMIN ACTION ONLY
    public async restoreMany(id: number): Promise<IResponse> {
        const propertyFound = await this.propertiesService.findOneWithDeleted(id);
        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.restore(image.id)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { statusCode: HttpStatus.OK, message: ImagesConfig.restoredMany };
            } else {
                throw new HttpException(ImagesConfig.notRestoredMany, HttpStatus.BAD_REQUEST);
            }
        } else {
            return { statusCode: HttpStatus.OK, message: ImagesConfig.notFoundToRestore };
        }
    }

    validateSameUser(image: Image, activeUser: IActiveUser): void {
        if (activeUser.role !== Role.ADMIN && image.uploaded_by !== activeUser.id)
            throw new HttpException(ImagesConfig.ownerRequired, HttpStatus.UNAUTHORIZED);
    }
}
