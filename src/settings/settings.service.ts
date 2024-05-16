import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingDto } from './dto/create-setting.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { Setting } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(Setting) private settingRepository: Repository<Setting>) {}

    async create(createSettingDto: CreateSettingDto): Promise<IResponse | HttpException> {
        const createSetting = this.settingRepository.create(createSettingDto);
        const setting = await this.settingRepository.save(createSetting);
        if (!setting) throw new HttpException('Setting not created', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Setting created' };
    }

    findAll() {
        return `This action returns all settings`;
    }

    async findOne(name: string) {
        const setting = await this.settingRepository.findOne({ where: { name } });
        if (!setting) throw new HttpException('Setting not found', HttpStatus.NOT_FOUND);
        return setting;
    }

    async update(id: number, updateSettingDto: UpdateSettingDto) {
        console.log(id, updateSettingDto);
        const setting = await this.settingRepository.update(id, { ...updateSettingDto });
        if (setting.affected === 0) throw new HttpException('Setting not updated', HttpStatus.BAD_REQUEST);
        return { statusCode: HttpStatus.OK, message: 'Setting updated' };
    }

    remove(id: number) {
        return `This action removes a #${id} setting`;
    }
}
