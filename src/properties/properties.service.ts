import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
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
        // return new HttpException('Property created', HttpStatus.OK);
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN) return await this.propertyRepository.find({ withDeleted: true });

        const properties = await this.propertyRepository.find({ where: { created_by: activeUser.id } });
        if (!properties) throw new HttpException('Properties not found', HttpStatus.NOT_FOUND);

        return properties;
    }

    async findOne(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.findOne({
            where: { id },
            relations: { images: true },
        });
    }

    async update(id: number, updatePropertyDto: UpdatePropertyDto, @ActiveUser() activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);
        const categoryUpdated = await this.propertyRepository.update(id, { ...updatePropertyDto });
        if (categoryUpdated.affected === 0) throw new HttpException('Property not updated', HttpStatus.BAD_REQUEST);
        throw new HttpException('Property updated', HttpStatus.OK);
    }

    async updateActive(id: number, activePropertyDto: ActivePropertyDto, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);

        return await this.propertyRepository.update(id, { is_active: activePropertyDto.is_active });
    }
    // TODO manejar los errores y Promise.all en map
    async removeSoft(id: number, activeUser: IActiveUser) {
        const property = await this.validateProperty(id);
        this.validateSameUser(property, activeUser);
        // console.log(property);
        // get all images here (ya vienen las imagenes con la relacion, no hacer el sig query?)
        // const images = await this.imagesService.findAllByProperty(id);
        
        // console.log(property.images);/OK!!!
        const imagesDeleted = property.images.map(async p => {
            console.log(p.name);
            const img = await this.imagesService.removeSoft(p.id, activeUser);
            console.log(img);
        })
        console.log(imagesDeleted);
        // return 'trying delete images';
        const propertyDeleted = await this.propertyRepository.softDelete(property.id);
        console.log(propertyDeleted);
        return new HttpException('Property deleted', HttpStatus.OK);
    }

    async restore(id: number) {
        const deletedProperty = await this.findOneWithDeleted(id);
        if (deletedProperty.deletedAt == null) throw new HttpException('Property is not soft deleted', HttpStatus.NOT_FOUND);

        const restoreProperty = await this.propertyRepository.restore({ id });
        if (restoreProperty.affected === 0) throw new HttpException('Property not restored', HttpStatus.NOT_MODIFIED);
        
        return new HttpException('Property restored', HttpStatus.OK);
    }

    async findOneWithDeleted(id: number) {
        const propertyDeleted = await this.propertyRepository.findOne({
            where: { id },
            withDeleted: true
        });
        
        if (!propertyDeleted) throw new HttpException('Property is not soft deleted', HttpStatus.NOT_FOUND);
        
        return propertyDeleted;
    }

    async remove(id: number) {
        const property = await this.propertyRepository.findOneBy({ id });
        if (!property) {
            const restore = await this.propertyRepository.restore({ id });
            if (!restore) throw new BadRequestException('Property not found');
        }

        return await this.propertyRepository.delete({ id });
    }

    async validateProperty(id: number) {
        const property = await this.propertyRepository.findOne({ where: { id }, relations: { images: true } });
        if (!property) throw new BadRequestException('Property not found');
        return property;
    }

    validateSameUser(property: Property, activeUser: IActiveUser) {
        if (activeUser.role !== Role.ADMIN && property.created_by !== activeUser.id) throw new UnauthorizedException('Ownership is required');
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

    // async propertiesByCategories() {
    //     const totalProperties = await this.propertyRepository.count();
    //     const categories = await this.categoriesService.findAll();
    //     console.log(categories);
    //     const query = `
    //         SELECT
    //             type AS category,
    //             color AS color,
    //             CONVERT(COUNT(*), UNSIGNED) AS total
    //         FROM
    //             property
    //         GROUP BY
    //             type, color
    //         `;
    //     const result = await this.propertyRepository.query(query);
    //     result.forEach((item: any) => {
    //         const category = categories.find((category) => category.name === item.category);
    //         item.plural = category.plural;
    //         item.total = Number(item.total);
    //         item.percentage = Number(((item.total / totalProperties) * 100).toFixed(2));
    //     });
    //     return result;
    // }
    // MANEJAR ERRORES ACÁ
    // async countByCreator(activeUser: IActiveUser) {
    //     const query = `
    //         SELECT type, COUNT(*) AS total
    //         FROM property
    //         WHERE created_by = ${activeUser.id}
    //         GROUP BY type;
    //     `;
    //     const result = await this.propertyRepository.query(query);
    //     console.log(result);
    //     return result;
    // }

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
