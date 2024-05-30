import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { State } from './entities/state.entity';
import { StatesConfig } from '../common/config/states.config';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
    constructor(@InjectRepository(State) private stateRepository: Repository<State>) {}

    async create(createStateDto: CreateStateDto): Promise<IResponse> {
        const stateExists = await this.stateRepository.findOneBy({ state: createStateDto.state });
        if (stateExists) throw new HttpException(StatesConfig.alreadyExists, HttpStatus.CONFLICT);
        
        const createState = this.stateRepository.create(createStateDto);
        const newState = await this.stateRepository.save(createState);
        if (!newState) throw new HttpException(StatesConfig.notCreated, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: StatesConfig.created };
    }

    async findAll(): Promise<State[]> {
        const states = await this.stateRepository.find();
        if (!states) throw new HttpException(StatesConfig.notFoundMany, HttpStatus.NOT_FOUND);
        
        return states;
    }

    async findAllAdmin(): Promise<State[]> {
        const states = await this.stateRepository.find({ withDeleted: true });
        if (!states) throw new HttpException(StatesConfig.notFoundMany, HttpStatus.NOT_FOUND);
        
        return states;
    }

    async findOne(id: number): Promise<State> {
        const state = await this.stateRepository.findOneBy({ id });
        if (!state) throw new HttpException(StatesConfig.notFound, HttpStatus.NOT_FOUND);
        
        return state;
    }

    async update(id: number, updateStateDto: UpdateStateDto): Promise<IResponse> {
        const stateUpdated = await this.stateRepository.update(id, { ...updateStateDto });
        if (stateUpdated.affected === 0) throw new HttpException(StatesConfig.notUpdated, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: StatesConfig.updated };
    }

    async remove(id: number): Promise<IResponse> {
        const stateFound = await this.stateRepository.findOne({ where: { id }, withDeleted: true });
        if (!stateFound) throw new HttpException(StatesConfig.notFound, HttpStatus.NOT_FOUND);
        
        const stateRemoved = await this.stateRepository.delete(id);
        if (stateRemoved.affected === 0) throw new HttpException(StatesConfig.notDeleted, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: StatesConfig.deleted };
    }

    async removeSoft(id: number): Promise<IResponse> {
        const stateFound = await this.stateRepository.findOneBy({ id });
        if (!stateFound) throw new HttpException(StatesConfig.notFound, HttpStatus.NOT_FOUND);
        
        const stateSoftRemoved = await this.stateRepository.softDelete({ id });
        if (stateSoftRemoved.affected === 0) throw new HttpException(StatesConfig.notDeleted, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: StatesConfig.deleted };
    }

    async restore(id: number): Promise<IResponse> {
        const stateFound = await this.stateRepository.findOne({ where: { id }, withDeleted: true });
        if (!stateFound) throw new HttpException(StatesConfig.notFound, HttpStatus.NOT_FOUND);
        
        const stateRestored = await this.stateRepository.restore({ id });
        if (stateRestored.affected === 0) throw new HttpException(StatesConfig.notRestored, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: StatesConfig.restored };
    }
}
