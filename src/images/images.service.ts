import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { PropertiesService } from '../properties/properties.service';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { CreateImageDto } from './dto/create-image.dto';
import { Role } from '../common/enums/role.enum';
import * as fs from 'node:fs/promises';

@Injectable()
export class ImagesService {
    constructor(
        @Inject(forwardRef(() => PropertiesService)) private readonly propertiesService: PropertiesService,
        @InjectRepository(Image) private imageRepository: Repository<Image>
    ) {}

    async create(createImageDto: CreateImageDto, activeUser: IActiveUser) {
        const propertyFound = await this.propertiesService.findOne(createImageDto.propertyId, activeUser);
        this.propertiesService.validateSameUser(propertyFound, activeUser);

        const imageCreated = await this.imageRepository.save(createImageDto);
        if (!imageCreated) throw new HttpException('Image not created', HttpStatus.BAD_REQUEST);

        return { message: 'Image created', statusCode: HttpStatus.OK};
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN) return await this.imageRepository.find();
        return await this.imageRepository.find({ where: { uploaded_by: activeUser.id } });
    }

    async findAllByProperty(id: number) {
        // TODO ERROR HANDLING check if property exists
        return await this.imageRepository.find({ where: { propertyId: id } });
    }

    async findAllByPropertyWithDeleted(id: number) {
        // TODO ERROR HANDLING check if property exists
        return await this.imageRepository.find({ where: { propertyId: id }, withDeleted: true });
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const image = await this.imageRepository.findOneBy({ id });
        if (!image) throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        this.validateSameUser(image, activeUser);

        return image;
    }

    async remove(id: number) {
        // throw new HttpException('Image not unlinked', HttpStatus.BAD_REQUEST);
        const imageFound = await this.imageRepository.findOne({ where: { id }, withDeleted: true });
        if (!imageFound) throw new HttpException('Image not found', HttpStatus.NOT_FOUND);

        try {
            const imageUnlinked = await fs.unlink(`../room202/src/assets/photos/${imageFound.name}`);
            console.log(imageUnlinked);
        } catch (error) {
           throw new HttpException('Image not unlinked', HttpStatus.BAD_REQUEST);
        }

        const imageDeleted = await this.imageRepository.delete({ id });
        if (imageDeleted.affected === 0) throw new HttpException('Image not deleted', HttpStatus.BAD_REQUEST);

        return { message: 'Image deleted', statusCode: HttpStatus.OK };
    }

    async removeSoft(id: number, activeUser: IActiveUser) {
        const imageFound = await this.imageRepository.findOneBy({ id });
        if (!imageFound) throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        this.validateSameUser(imageFound, activeUser);

        const deleted = await this.imageRepository.softDelete({ id });
        if (deleted.affected === 0) throw new HttpException('Image not deleted', HttpStatus.BAD_REQUEST);

        return { message: 'Image deleted', statusCode: HttpStatus.OK };
    }
    // FUNCIONANDO OK
    async removeSoftMany(id: number, activeUser: IActiveUser) {
        const propertyFound = await this.propertiesService.findOne(id, activeUser);

        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.removeSoft(image.id, activeUser)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { message: 'Images deleted', statusCode: HttpStatus.OK };
            } else {
                throw new HttpException('Images not deleted', HttpStatus.BAD_REQUEST);
            }
        } else {
            return { message: 'No images to delete', statusCode: HttpStatus.OK };
        }
    }

    async removeMany(id: number) {
        const propertyFound = await this.propertiesService.findOneWithDeleted(id);

        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.remove(image.id)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { message: 'Images deleted', statusCode: HttpStatus.OK };
            } else {
                throw new HttpException('Images not deleted', HttpStatus.BAD_REQUEST);
            }
        } else {
            return { message: 'No images to delete', statusCode: HttpStatus.OK };
        }
    }
    // ADMIN ACTION ONLY
    async restore(id: number) {
        const restoreImage = await this.imageRepository.restore({ id });
        if (restoreImage.affected === 0) throw new HttpException('Image not restored', HttpStatus.NOT_MODIFIED);
        return { message: 'Image restored', statusCode: HttpStatus.OK };
    }
    // ADMIN ACTION ONLY
    public async restoreMany(id: number) {
        const propertyFound = await this.propertiesService.findOneWithDeleted(id);
        console.log(propertyFound);
        if (propertyFound.images.length > 0) {
            const imagesFound = propertyFound.images;
            const promises = await Promise.all(imagesFound.map((image) => this.restore(image.id)));

            if (promises.every((result) => result.statusCode === 200)) {
                return { message: 'Images restored', statusCode: HttpStatus.OK };
            } else {
                throw new HttpException('Images not restored', HttpStatus.BAD_REQUEST);
            }
        } else {
            return { message: 'No images to restore', statusCode: HttpStatus.OK };
        }
    }

    validateSameUser(image: Image, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && image.uploaded_by !== activeUser.id)
            throw new HttpException('Ownership is required', HttpStatus.UNAUTHORIZED);
    }
}
