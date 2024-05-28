import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
    constructor(@InjectRepository(City) private cityRepository: Repository<City>) {}

    async create(createCityDto: CreateCityDto): Promise<IResponse | HttpException> {
        const cityExists = await this.cityRepository.findOneBy({ city: createCityDto.city });
        if (cityExists) throw new HttpException('City already exists', HttpStatus.CONFLICT);
        const city = this.cityRepository.create(createCityDto);
        const newCity = await this.cityRepository.save(city);
        if (!newCity) throw new HttpException('City not created', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'City created' };
    }

    async findAll(): Promise<City[] | HttpException> {
        const cities = await this.cityRepository.find({
            order: {
                city: 'ASC',
            },
            relations: { state: true },
        });
        if (!cities) throw new HttpException('Cities not found', HttpStatus.NOT_FOUND);
        return cities;
    }

    async findAllAdmin(): Promise<City[] | HttpException> {
        const cities = await this.cityRepository.find({
            order: {
                city: 'ASC',
            },
            withDeleted: true,
            relations: { state: true },
        });
        if (!cities) throw new HttpException('Cities not found', HttpStatus.NOT_FOUND);
        return cities;
    }

    async findOne(id: number): Promise<City | HttpException> {
        const city = await this.cityRepository.findOne({ where: { id: id }, relations: { state: true } });
        if (!city) throw new HttpException('City not found', HttpStatus.NOT_FOUND);
        return city;
    }

    async update(id: number, updateCityDto: UpdateCityDto): Promise<IResponse | HttpException> {
        const updateCity = await this.cityRepository.update(id, { ...updateCityDto });
        if (updateCity.affected === 0) throw new HttpException('City not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'City updated' };
    }

    async remove(id: number): Promise<IResponse | HttpException> {
        const deleteCity = await this.cityRepository.delete(id);
        if (deleteCity.affected === 0) throw new HttpException('City not deleted', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'City deleted' };
    }

    async removeSoft(id: number): Promise<IResponse | HttpException> {
        const deleteCity = await this.cityRepository.softDelete({ id });
        if (deleteCity.affected === 0) throw new HttpException('City not deleted', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'City deleted' };
    }

    async restore(id: number): Promise<IResponse | HttpException> {
        const restoreCity = await this.cityRepository.restore({ id });
        if (restoreCity.affected === 0) throw new HttpException('City not restored', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'City restored' };
    }
}
