import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingDto } from './dto/create-setting.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { Setting } from './entities/setting.entity';
import { SettingsConfig } from '../common/config/settings.config';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(Setting) private settingRepository: Repository<Setting>) {}

    async create(createSettingDto: CreateSettingDto): Promise<IResponse> {
        const createSetting = this.settingRepository.create(createSettingDto);
        const setting = await this.settingRepository.save(createSetting);
        if (!setting) throw new HttpException(SettingsConfig.notCreated, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: SettingsConfig.created };
    }

    async findOne(name: string): Promise<Setting> {
        const setting = await this.settingRepository.findOne({ where: { name } });
        if (!setting) throw new HttpException(SettingsConfig.notFound, HttpStatus.NOT_FOUND);
        
        return setting;
    }

    async update(id: number, updateSettingDto: UpdateSettingDto): Promise<IResponse> {
        const setting = await this.settingRepository.update(id, { ...updateSettingDto });
        if (setting.affected === 0) throw new HttpException(SettingsConfig.notUpdated, HttpStatus.BAD_REQUEST);
        
        return { statusCode: HttpStatus.OK, message: SettingsConfig.updated };
    }
}
