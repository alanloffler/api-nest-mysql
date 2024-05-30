import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoritesConfig } from '../common/config/favorites.config';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { PropertiesService } from '../properties/properties.service';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite) private favoriteRepository: Repository<Favorite>,
        @Inject(forwardRef(() => PropertiesService)) private readonly propertiesService: PropertiesService,
        private readonly usersService: UsersService,
    ) {}

    async create(propertyId: number, activeUser: IActiveUser): Promise<IResponse> {
        const user = await this.usersService.findOne(activeUser.id);
        if (!user) throw new HttpException(FavoritesConfig.userNotFound, HttpStatus.NOT_FOUND);

        const property = await this.propertiesService.validateProperty(propertyId);
        const createFavorite = this.favoriteRepository.create({ propertyId: property.id, userId: activeUser.id });
        const createdFavorite = await this.favoriteRepository.save(createFavorite);
        if (!createdFavorite) throw new HttpException(FavoritesConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: FavoritesConfig.created };
    }

    async findAll(activeUser: IActiveUser): Promise<Favorite[]> {
        if (activeUser.role === Role.ADMIN) {
            const favorites = await this.favoriteRepository.find({
                where: { userId: activeUser.id },
                withDeleted: true,
                order: { id: 'DESC' },
            });
            if (!favorites) throw new HttpException(FavoritesConfig.notFoundMany, HttpStatus.NOT_FOUND);

            return favorites;
        }
        const favorites = await this.favoriteRepository.find({
            where: { userId: activeUser.id },
            order: { id: 'DESC' },
        });
        if (!favorites) throw new HttpException(FavoritesConfig.notFound, HttpStatus.NOT_FOUND);

        return favorites;
    }

    async findOne(id: number, activeUser: IActiveUser): Promise<Favorite> {
        const favorite = await this.favoriteRepository.findOneBy({ propertyId: id, userId: activeUser.id });
        if (!favorite) return;

        return favorite;
    }

    async remove(id: number): Promise<IResponse> {
        const deleteFavorite = await this.favoriteRepository.delete({ propertyId: id });
        if (deleteFavorite.affected === 0) throw new HttpException(FavoritesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: FavoritesConfig.deleted };
    }
}
