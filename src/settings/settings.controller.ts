import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateSettingDto } from './dto/create-setting.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Auth(Role.ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Roles(Role.USER)
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.settingsService.findOne(name);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }
}
