import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { PropertiesService } from '../properties/properties.service';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite) private favoriteRepository: Repository<Favorite>,
        private readonly propertysService: PropertiesService,
        private readonly usersService: UsersService,
    ) {}

    async create(propertyId: number, activeUser: IActiveUser) {
        console.log(propertyId, activeUser);
        const user = await this.usersService.findOne(activeUser.id);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const property = await this.propertysService.validateProperty(propertyId);
        this.propertysService.validateSameUser(property, activeUser);
        const createFavorite = this.favoriteRepository.create({ propertyId: property.id, userId: activeUser.id });
        const createdFavorite = await this.favoriteRepository.save(createFavorite);
        console.log(createdFavorite);
        if (!createdFavorite) throw new HttpException('Favorite not created', HttpStatus.BAD_REQUEST);
        return { message: 'Favorite created', statusCode: HttpStatus.OK };
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN)
            return await this.favoriteRepository.find({
                where: { userId: activeUser.id },
                withDeleted: true,
                order: { id: 'DESC' },
            });
        const favorites = await this.favoriteRepository.find({
            where: { userId: activeUser.id },
            order: { id: 'DESC' },
        });
        if (!favorites) throw new HttpException('Favorites not found', HttpStatus.NOT_FOUND);
        return favorites;
    }

    async remove(id: number) {
        const deleteFavorite = await this.favoriteRepository.delete({ propertyId: id });
        if (deleteFavorite.affected === 0) throw new HttpException('Favorite not deleted', HttpStatus.BAD_REQUEST);
        return { message: 'Favorite deleted', statusCode: HttpStatus.OK };
    }
}
