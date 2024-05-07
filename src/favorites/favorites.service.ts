import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { PropertiesService } from '../properties/properties.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite) private favoriteRepository: Repository<Favorite>,
        private readonly propertysService: PropertiesService,
        private readonly usersService: UsersService
    ) {}

    async create(propertyId: number, activeUser: IActiveUser) {
        const user = await this.usersService.findOne(activeUser.id);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        const property = await this.propertysService.validateProperty(propertyId);
        this.propertysService.validateSameUser(property, activeUser);

        const createFavorite = this.favoriteRepository.create({ propertyId, userId: activeUser.id });
        const createdFavorite = await this.favoriteRepository.save(createFavorite);
        if (!createdFavorite) throw new HttpException('Favorite not created', HttpStatus.BAD_REQUEST);
        
        return { message: 'Favorite created', statusCode: HttpStatus.OK };
    }

    async findAll(activeUser: IActiveUser) {
        if (activeUser.role === Role.ADMIN)
            return await this.favoriteRepository.find({
                withDeleted: true,
                order: { id: 'DESC' }
            });
        
        const favorites = await this.favoriteRepository.find({
            where: { userId: activeUser.id },
            order: { id: 'DESC' }
        });
        if (!favorites) throw new HttpException('Favorites not found', HttpStatus.NOT_FOUND);

        return favorites;
    }

    findOne(id: number) {
        return `This action returns a #${id} favorite`;
    }

    remove(id: number) {
        return `This action removes a #${id} favorite`;
    }
}
