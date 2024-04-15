import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { PropertiesService } from '../properties/properties.service';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { CreateImageDto } from './dto/create-image.dto';
import { Role } from '../common/enums/role.enum';
// import * as fs from 'node:fs/promises';

@Injectable()
export class ImagesService {
    constructor(
        @Inject(forwardRef(() => PropertiesService)) private readonly propertiesService: PropertiesService,
        @InjectRepository(Image) private imageRepository: Repository<Image>,
    ) {}

    async create(createImageDto: CreateImageDto, activeUser: IActiveUser) {
        const propertyFound = await this.propertiesService.findOne(createImageDto.propertyId, activeUser);
        this.propertiesService.validateSameUser(propertyFound, activeUser);

        const imageCreated = await this.imageRepository.save(createImageDto);
        if (!imageCreated) throw new HttpException('Image not created', HttpStatus.BAD_REQUEST);

        return new HttpException('Image created', HttpStatus.OK);
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN) return await this.imageRepository.find();
        return await this.imageRepository.find({ where: { uploaded_by: activeUser.id } });
    }

    async findAllByProperty(id: number) {
        // check if property exists
        return await this.imageRepository.find({ where: { propertyId: id } });
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const image = await this.imageRepository.findOneBy({ id });
        if (!image) throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        this.validateSameUser(image, activeUser);

        return image;
    }
    // ONLY ADMIN CAN DELETE IMAGES LIKE THIS
    // Remove all files from uploads folder and database.
    // First restore if there are soft deleted images
    async remove(propertyId: number) {
        console.log(propertyId);
        // try {
        //     const allImages = await this.imageRepository.find({
        //         where: { property_id: propertyId },
        //         withDeleted: true,
        //     });
        //     if (allImages.length === 0) throw new HttpException('No images to delete', HttpStatus.NOT_FOUND);
        //     if (allImages.length > 0) {
        //         allImages.map(async (image) => {
        //             await this.imageRepository.restore({ id: image.id });
        //             await fs.unlink(`./uploads/${image.name}`).then(() => {
        //                 console.log('Images deleted from folder');
        //             })
        //             .catch(error => {
        //                 console.log(error);
        //                 throw new HttpException(error.code, HttpStatus.UNPROCESSABLE_ENTITY);
        //             });
        //         });
        //         const imagesDB = await this.imageRepository.delete({ property_id: propertyId });
        //         if (imagesDB.affected > 0) throw new HttpException('Images deleted from DB', HttpStatus.OK);
        //     }
        // } catch(error) {
        //     throw new HttpException(error.message, error.status);
        // }
    }

    // trying onDelete cascade!
    // FOR USERS AND ADMIN, REMOVE SOFT ALL IMAGES WHEN REMOVE SOFT AN PROPERTY
    // async removeSoftAll(propertyId: number, activeUser: IActiveUser) {
    //     const images = await this.imageRepository.find({ where: { property_id: propertyId } });
    //     if (images.length === 0) throw new HttpException('No images to delete', HttpStatus.NOT_FOUND);
    //     if (images.length > 0) {
    //         images.map(async (image) => {
    //             await this.removeSoft(image.id, activeUser);
    //         });
    //         throw new HttpException('Images deleted', HttpStatus.OK);
    //     }
    // }

    async removeSoft(id: number, activeUser: IActiveUser) {
        // throw new HttpException('Image not deleted', HttpStatus.BAD_REQUEST);
        const imageFound = await this.imageRepository.findOneBy({ id });
        if (!imageFound) throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        this.validateSameUser(imageFound, activeUser);

        const deleted = await this.imageRepository.softDelete({ id });
        if (deleted.affected === 0) throw new HttpException('Image not deleted', HttpStatus.BAD_REQUEST);
        return { message: 'Image deleted', status: HttpStatus.OK };
    }

    async restore(id: number) {
        const restoreImage = await this.imageRepository.restore({ id });
        if (restoreImage.affected === 0) throw new HttpException('Image not restored', HttpStatus.NOT_MODIFIED);
        throw new HttpException('Image restored', HttpStatus.OK);
    }

    validateSameUser(image: Image, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && image.uploaded_by !== activeUser.id)
            throw new HttpException('Ownership is required', HttpStatus.UNAUTHORIZED);
    }

    // private async validateImage(id: number) {
    //     const image = await this.imageRepository.findOneBy({ id });
    //     if (!image) throw new BadRequestException('Image not found');
    //     return image;
    // }
}
