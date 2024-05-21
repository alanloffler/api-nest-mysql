import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivePropertyDto } from './dto/active-property.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { CategoriesService } from '../categories/categories.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Property } from './entities/property.entity';
import { Role } from '../common/enums/role.enum';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UsersService } from '../users/users.service';
import { ImagesService } from '../images/images.service';

@Injectable()
export class PropertiesService {
    constructor(
        @Inject(forwardRef(() => ImagesService)) private readonly imagesService: ImagesService,
        @InjectRepository(Property) private propertyRepository: Repository<Property>,
        private readonly categoriesService: CategoriesService,
        private readonly usersService: UsersService,
    ) {}

    async create(createPropertyDto: CreatePropertyDto, activeUser: IActiveUser) {
        const user = await this.usersService.findOne(activeUser.id);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        const createdProperty = await this.propertyRepository.save({ ...createPropertyDto, created_by: activeUser.id });
        if (!createdProperty) throw new HttpException('Property not created', HttpStatus.BAD_REQUEST);

        return createdProperty;
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN)
            return await this.propertyRepository.find({
                withDeleted: true,
                order: { created_at: 'DESC' },
                relations: { user: true },
            });

        const properties = await this.propertyRepository.find({
            where: { created_by: activeUser.id },
            order: { created_at: 'DESC' },
            relations: { user: true },
        });
        if (!properties) throw new HttpException('Properties not found', HttpStatus.NOT_FOUND);

        return properties;
    }

    async findAllClient() {
        const properties = await this.propertyRepository.find({
            order: { created_at: 'DESC' },
            relations: { user: true },
        });
        if (!properties) throw new HttpException('Properties not found', HttpStatus.NOT_FOUND);
        return properties;
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.findOne({
            where: { id },
            relations: { images: true, user: true },
        });
    }

    async findOneWithDeleted(id: number) {
        const propertyDeleted = await this.propertyRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: { images: true, user: true },
        });
        if (!propertyDeleted) throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
        return propertyDeleted;
    }

    async update(id: number, updatePropertyDto: UpdatePropertyDto, @ActiveUser() activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);
        const categoryUpdated = await this.propertyRepository.update(id, { ...updatePropertyDto });
        if (categoryUpdated.affected === 0) throw new HttpException('Property not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Property updated' };
    }

    async updateActive(id: number, activePropertyDto: ActivePropertyDto, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        const propertyUpdated = await this.propertyRepository.update(id, { is_active: activePropertyDto.is_active });
        if (propertyUpdated.affected === 0) throw new HttpException('Property not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Property updated' };
    }

    async restore(id: number) {
        const propertyDeleted = await this.findOneWithDeleted(id);
        const propertyRestored = await this.propertyRepository.restore({ id: propertyDeleted.id });
        if (propertyRestored.affected === 0) throw new HttpException('Property not restored', HttpStatus.BAD_REQUEST);

        if (propertyRestored.affected > 0) {
            await this.propertyRepository.update(id, { is_active: 1 });
            if (propertyDeleted.images.length > 0) {
                const imagesRestored = await this.imagesService.restoreMany(id);
                if (imagesRestored.statusCode !== HttpStatus.OK) throw new HttpException('Error when restoring images', HttpStatus.BAD_REQUEST);
                return { statusCode: HttpStatus.OK, message: 'Property restored (with images)' };
            } else {
                return { statusCode: HttpStatus.OK, message: 'Property restored (no images)' };
            }
        }
    }

    async removeSoft(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        if (property.deletedAt !== null) throw new HttpException('Property already deleted', HttpStatus.BAD_REQUEST);
        this.validateSameUser(property, activeUser);

        const deletedImages = await this.imagesService.removeSoftMany(id, activeUser);
        if (deletedImages.statusCode !== HttpStatus.OK)
            throw new HttpException('Property not deleted. Error when deleting images', HttpStatus.BAD_REQUEST);
        if (deletedImages.statusCode === 200 || property.images.length === 0) {
            await this.propertyRepository.update(id, { is_active: 0 });
            const propertyDeleted = await this.propertyRepository.softDelete({ id });
            if (propertyDeleted.affected === 0) throw new HttpException('Property not deleted', HttpStatus.NOT_MODIFIED);

            return { statusCode: HttpStatus.OK, message: 'Property deleted' };
        }
    }

    async remove(id: number) {
        const propertyFound = await this.findOneWithDeleted(id);
        if (!propertyFound) throw new HttpException('Property not found', HttpStatus.NOT_FOUND);

        if (propertyFound.images.length > 0) {
            const unlinkImages = await this.imagesService.removeMany(id);
            if (unlinkImages.statusCode !== HttpStatus.OK) throw new HttpException('Error when deleting images', HttpStatus.BAD_REQUEST);
        }

        const propertyDeleted = await this.propertyRepository.delete({ id });
        if (!propertyDeleted) throw new HttpException('Property not deleted', HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: 'Property deleted' };
    }

    async validateProperty(id: number) {
        const property = await this.propertyRepository.findOne({ where: { id }, relations: { images: true }, withDeleted: true });
        if (!property) throw new HttpException('Property not found', HttpStatus.BAD_REQUEST);

        return property;
    }

    validateSameUser(property: Property, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && property.created_by !== activeUser.id)
            throw new HttpException('Ownership is required', HttpStatus.UNAUTHORIZED);
    }

    // DASHBOARD
    async findLatest(amount: number) {
        if (amount < 1) throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
        if (!Number.isInteger(amount)) throw new HttpException('Amount must be an integer', HttpStatus.BAD_REQUEST);
        const latestProperties = await this.propertyRepository.find({
            take: amount,
            order: { created_at: 'DESC' },
            relations: { images: true },
        });
        if (latestProperties.length < 1) throw new HttpException('Properties not found', HttpStatus.NOT_FOUND);
        return latestProperties;
    }

    async findLatestActiveUser(amount: number, activeUser: IActiveUser) {
        if (amount < 1) throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
        if (!Number.isInteger(amount)) throw new HttpException('Amount must be an integer', HttpStatus.BAD_REQUEST);
        const latestProperties = await this.propertyRepository.find({
            take: amount,
            order: { created_at: 'DESC' },
            relations: { images: true },
            where: {
                created_by: activeUser.id
            }
        });
        if (latestProperties.length < 1) throw new HttpException('Properties not found', HttpStatus.NOT_FOUND);
        return latestProperties;
    }

    async dashboardStats(activeUser: IActiveUser) {
        // try and catch
        const sql = `
            SELECT
                p.type AS category,
                p.color AS color,
                c.plural AS plural,
                COUNT(*) AS total,
                COALESCE(owner_count, 0) AS owner
            FROM
                property p
            LEFT JOIN (
                SELECT
                    type AS type,
                    COUNT(*) AS owner_count
                FROM
                    property
                WHERE
                    created_by = ${activeUser.id}
                GROUP BY
                    type
            ) subquery ON p.type = subquery.type
            LEFT JOIN category c ON p.type = c.name
            GROUP BY
                p.type, p.color, c.plural;
        `;
        const data = await this.propertyRepository.query(sql);
        const total = data.reduce((a: number, b: any) => a + Number(b.total), 0);
        data.forEach((d: any) => {
            d.total = Number(d.total);
            d.owner = Number(d.owner);
            d.percentage = Number(((d.total / total) * 100).toFixed(2));
        });
        return data;
    }
}
