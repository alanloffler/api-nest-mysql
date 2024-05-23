import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { State } from './entities/state.entity';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
    constructor(@InjectRepository(State) private stateRepository: Repository<State>) {}

    async create(createStateDto: CreateStateDto): Promise<State | HttpException> {
        const stateExists = await this.stateRepository.findOneBy({ state: createStateDto.state });
        if (stateExists) throw new HttpException('State already exists', HttpStatus.BAD_REQUEST);
        const createState = this.stateRepository.create(createStateDto);
        const newState = await this.stateRepository.save(createState);
        if (!newState) throw new HttpException('State not created', HttpStatus.BAD_REQUEST);
        return newState;
    }

    async findAll(): Promise<State[] | HttpException> {
        const states = await this.stateRepository.find();
        if (!states) throw new HttpException('States not found', HttpStatus.NOT_FOUND);
        return states;
    }

    async findAllAdmin(): Promise<State[] | HttpException> {
        const states = await this.stateRepository.find({ withDeleted: true });
        if (!states) throw new HttpException('States not found', HttpStatus.NOT_FOUND);
        return states;
    }

    async findOne(id: number): Promise<State | HttpException> {
        const state = await this.stateRepository.findOneBy({ id });
        if (!state) throw new HttpException('State not found', HttpStatus.NOT_FOUND);
        return state;
    }

    async update(id: number, updateStateDto: UpdateStateDto): Promise<IResponse | HttpException> {
        const stateUpdated = await this.stateRepository.update(id, { ...updateStateDto });
        if (stateUpdated.affected === 0) throw new HttpException('State not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'State updated' };
    }

    async remove(id: number): Promise<IResponse | HttpException> {
        const stateFound = await this.stateRepository.findOne({ where: { id }, withDeleted: true });
        if (!stateFound) throw new HttpException('State not found', HttpStatus.NOT_FOUND);
        const stateRemoved = await this.stateRepository.delete(id);
        if (stateRemoved.affected === 0) throw new HttpException('State not deleted', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'State deleted' };
    }

    async removeSoft(id: number) {
        const stateFound = await this.stateRepository.findOneBy({ id });
        if (!stateFound) throw new HttpException('State not found', HttpStatus.NOT_FOUND);
        const stateSoftRemoved = await this.stateRepository.softDelete({ id });
        if (stateSoftRemoved.affected === 0) throw new HttpException('State not deleted', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'State deleted' };
    }

    async restore(id: number) {
        const stateFound = await this.stateRepository.findOne({ where: { id }, withDeleted: true });
        if (!stateFound) throw new HttpException('State not found', HttpStatus.NOT_FOUND);
        const stateRestored = await this.stateRepository.restore({ id });
        if (stateRestored.affected === 0) throw new HttpException('State not restored', HttpStatus.NOT_MODIFIED);
        return { statusCode: HttpStatus.OK, message: 'State restored' };
    }
}
