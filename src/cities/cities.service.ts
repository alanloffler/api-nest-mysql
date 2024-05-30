import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitiesConfig } from '../common/config/cities.config';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
    constructor(@InjectRepository(City) private cityRepository: Repository<City>) {}

    async create(createCityDto: CreateCityDto): Promise<IResponse> {
        const cityExists = await this.cityRepository.findOneBy({ city: createCityDto.city });
        if (cityExists) throw new HttpException(CitiesConfig.alreadyExists, HttpStatus.CONFLICT);

        const city = this.cityRepository.create(createCityDto);
        const newCity = await this.cityRepository.save(city);
        if (!newCity) throw new HttpException(CitiesConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CitiesConfig.created };
    }

    async findAll(): Promise<City[]> {
        const cities = await this.cityRepository.find({
            order: {
                city: 'ASC',
            },
            relations: { state: true },
        });
        if (!cities) throw new HttpException(CitiesConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return cities;
    }

    async findAllAdmin(): Promise<City[]> {
        const cities = await this.cityRepository.find({
            order: {
                city: 'ASC',
            },
            withDeleted: true,
            relations: { state: true },
        });
        if (!cities) throw new HttpException(CitiesConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return cities;
    }

    async findOne(id: number): Promise<City> {
        const city = await this.cityRepository.findOne({ where: { id: id }, relations: { state: true } });
        if (!city) throw new HttpException(CitiesConfig.notFound, HttpStatus.NOT_FOUND);

        return city;
    }

    async update(id: number, updateCityDto: UpdateCityDto): Promise<IResponse> {
        const updateCity = await this.cityRepository.update(id, { ...updateCityDto });
        if (updateCity.affected === 0) throw new HttpException(CitiesConfig.notUpdated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CitiesConfig.updated };
    }

    async remove(id: number): Promise<IResponse> {
        const deleteCity = await this.cityRepository.delete(id);
        if (deleteCity.affected === 0) throw new HttpException(CitiesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CitiesConfig.deleted };
    }

    async removeSoft(id: number): Promise<IResponse> {
        const deleteCity = await this.cityRepository.softDelete({ id });
        if (deleteCity.affected === 0) throw new HttpException(CitiesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CitiesConfig.deleted };
    }

    async restore(id: number): Promise<IResponse> {
        const restoreCity = await this.cityRepository.restore({ id });
        if (restoreCity.affected === 0) throw new HttpException(CitiesConfig.notRestored, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CitiesConfig.restored };
    }
}
